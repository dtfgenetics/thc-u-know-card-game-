<?php
declare(strict_types=1);

const THC_COLORS = ['purple', 'green', 'gold', 'blue'];
const THC_HAND_SIZE = 7;
const THC_MAX_PLAYERS = 8;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $data = request_data();
    $action = preg_replace('/[^a-z_]/', '', strtolower((string)($data['action'] ?? '')));

    if ($action === 'health') {
        respond(['ok' => true, 'service' => 'thc-u-know', 'mode' => 'shared-hosting']);
    }

    if ($action === 'create') {
        create_room($data);
    }

    $code = normalize_code($data['code'] ?? null);
    if (!$code) {
        fail('A valid six-character room code is required.', 400);
    }

    if ($action === 'join') {
        join_room($code, $data);
    }

    with_room($code, function (array $room) use ($action, $data): array {
        $player = authenticated_player($room, $data, $action === 'state');

        if ($action === 'state') {
            if ($player) {
                $room = touch_player($room, $player['id']);
            }
            return [$room, public_room($room, $player['id'] ?? null)];
        }

        if (!$player) {
            fail('Reconnect failed. Rejoin the room from the invite link.', 403);
        }

        $playerId = $player['id'];

        if ($action === 'ready') {
            assert_lobby($room);
            $ready = !empty($data['ready']);
            foreach ($room['players'] as &$entry) {
                if ($entry['id'] === $playerId) {
                    $entry['ready'] = $ready;
                    $entry['connected'] = true;
                    break;
                }
            }
            unset($entry);
            add_log($room, player_name($room, $playerId) . ($ready ? ' is ready.' : ' is not ready.'));
            return [$room, public_room($room, $playerId)];
        }

        if ($action === 'start') {
            assert_lobby($room);
            if (($room['hostPlayerId'] ?? '') !== $playerId) {
                fail('Only the host can start the game.', 403);
            }
            $activePlayers = array_values(array_filter($room['players'], fn($entry) => empty($entry['left'])));
            if (count($activePlayers) < 2) {
                fail('At least two players are required.', 409);
            }
            foreach ($activePlayers as $entry) {
                if (empty($entry['ready'])) {
                    fail('Every player must mark ready before starting.', 409);
                }
            }
            $room = start_game($room);
            return [$room, public_room($room, $playerId)];
        }

        if ($action === 'draw') {
            assert_playing($room);
            assert_current_player($room, $playerId);
            $amount = max(1, (int)($room['pendingDraw'] ?? 0));
            draw_cards_for_player($room, $playerId, $amount);
            $room['pendingDraw'] = 0;
            add_log($room, player_name($room, $playerId) . " drew {$amount} card" . ($amount === 1 ? '.' : 's.'));
            advance_turn($room);
            return [$room, public_room($room, $playerId)];
        }

        if ($action === 'play') {
            assert_playing($room);
            assert_current_player($room, $playerId);
            $cardId = (string)($data['cardId'] ?? '');
            $chosenColor = normalize_color($data['chosenColor'] ?? null);
            play_card($room, $playerId, $cardId, $chosenColor);
            return [$room, public_room($room, $playerId)];
        }

        if ($action === 'leave') {
            foreach ($room['players'] as &$entry) {
                if ($entry['id'] === $playerId) {
                    $entry['left'] = true;
                    $entry['connected'] = false;
                }
            }
            unset($entry);
            add_log($room, player_name($room, $playerId) . ' left the table.');
            return [$room, public_room($room, null)];
        }

        fail('Unknown action.', 400);
    });
} catch (Throwable $error) {
    if ($error instanceof RuntimeException) {
        $parts = explode('|', $error->getMessage(), 2);
        $status = isset($parts[1]) ? max(400, min(599, (int)$parts[0])) : 500;
        $message = $parts[1] ?? $error->getMessage();
        fail($message, $status);
    }
    error_log($error->getMessage());
    fail('The table hit a server error.', 500);
}

function request_data(): array
{
    $raw = file_get_contents('php://input') ?: '{}';
    $data = json_decode($raw, true);
    $body = is_array($data) ? $data : [];
    return array_merge($_GET, $body);
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    respond(['ok' => false, 'error' => ['message' => $message]], $status);
}

function throw_fail(string $message, int $status = 400): void
{
    throw new RuntimeException($status . '|' . $message);
}

function storage_dir(): string
{
    $home = dirname(__DIR__, 6);
    $dir = $home . '/private/thc-u-know-rooms';
    if (!is_dir($home)) {
        $dir = __DIR__ . '/../.rooms';
    }
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw_fail('Room storage is not writable.', 500);
    }
    return $dir;
}

function room_path(string $code): string
{
    return storage_dir() . '/' . $code . '.json';
}

function normalize_code(mixed $value): ?string
{
    $code = strtoupper(preg_replace('/[^A-Z0-9]/i', '', (string)$value));
    return preg_match('/^[A-HJ-NP-Z2-9]{6}$/', $code) ? $code : null;
}

function normalize_color(mixed $value): ?string
{
    $color = strtolower(trim((string)$value));
    return in_array($color, THC_COLORS, true) ? $color : null;
}

function clean_name(mixed $value): string
{
    $name = trim(preg_replace('/\s+/', ' ', (string)$value));
    $name = substr($name, 0, 24);
    return $name !== '' ? $name : 'Grower';
}

function new_token(): string
{
    return bin2hex(random_bytes(20));
}

function token_hash(string $token): string
{
    return hash('sha256', $token);
}

function create_room(array $data): void
{
    $name = clean_name($data['name'] ?? null);
    for ($attempt = 0; $attempt < 40; $attempt += 1) {
        $code = generate_code();
        $path = room_path($code);
        if (file_exists($path)) {
            continue;
        }

        $token = new_token();
        $player = make_player($name, true, $token);
        $room = [
            'code' => $code,
            'status' => 'lobby',
            'hostPlayerId' => $player['id'],
            'players' => [$player],
            'deck' => [],
            'discard' => [],
            'currentPlayerIndex' => 0,
            'direction' => 1,
            'currentColor' => null,
            'pendingDraw' => 0,
            'winnerId' => null,
            'log' => [],
            'createdAt' => time(),
            'updatedAt' => time(),
        ];
        add_log($room, "{$name} created the room.");
        file_put_contents($path, json_encode($room, JSON_UNESCAPED_SLASHES), LOCK_EX);
        respond(['ok' => true, 'session' => session_payload($player, $token), 'room' => public_room($room, $player['id'])]);
    }
    fail('Could not allocate a room code.', 500);
}

function join_room(string $code, array $data): void
{
    $token = new_token();
    $name = clean_name($data['name'] ?? null);

    with_room($code, function (array $room) use ($name, $token): array {
        if (($room['status'] ?? 'lobby') !== 'lobby') {
            throw_fail('This room has already started.', 409);
        }
        $activePlayers = array_values(array_filter($room['players'], fn($entry) => empty($entry['left'])));
        if (count($activePlayers) >= THC_MAX_PLAYERS) {
            throw_fail('This table is full.', 409);
        }
        $player = make_player($name, false, $token);
        $room['players'][] = $player;
        add_log($room, "{$name} joined the room.");
        return [$room, ['ok' => true, 'session' => session_payload($player, $token), 'room' => public_room($room, $player['id'])]];
    });
}

function with_room(string $code, callable $callback): void
{
    $path = room_path($code);
    if (!file_exists($path)) {
        fail('This room could not be found.', 404);
    }
    $handle = fopen($path, 'r+');
    if (!$handle) {
        fail('Room storage is not writable.', 500);
    }
    flock($handle, LOCK_EX);
    $raw = stream_get_contents($handle);
    if ($raw === '' || $raw === false) {
        flock($handle, LOCK_UN);
        fclose($handle);
        fail('This room could not be found.', 404);
    }
    $room = json_decode($raw, true);
    if (!is_array($room)) {
        flock($handle, LOCK_UN);
        fclose($handle);
        fail('This room is damaged. Create a new room.', 500);
    }

    [$nextRoom, $payload] = $callback($room);
    $nextRoom['updatedAt'] = time();
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($nextRoom, JSON_UNESCAPED_SLASHES));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    respond($payload);
}

function generate_code(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 6; $i += 1) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $code;
}

function make_player(string $name, bool $host, string $token): array
{
    return [
        'id' => 'p_' . bin2hex(random_bytes(6)),
        'name' => $name,
        'tokenHash' => token_hash($token),
        'host' => $host,
        'ready' => false,
        'connected' => true,
        'left' => false,
        'hand' => [],
        'joinedAt' => time(),
        'lastSeenAt' => time(),
    ];
}

function session_payload(array $player, string $token): array
{
    return ['playerId' => $player['id'], 'token' => $token];
}

function authenticated_player(array $room, array $data, bool $optional = false): ?array
{
    $playerId = (string)($data['playerId'] ?? '');
    $token = (string)($data['token'] ?? '');
    if ($playerId === '' || $token === '') {
        return $optional ? null : throw_fail('Missing player session.', 403);
    }
    $hash = token_hash($token);
    foreach ($room['players'] as $player) {
        if (($player['id'] ?? '') === $playerId && hash_equals((string)($player['tokenHash'] ?? ''), $hash)) {
            return $player;
        }
    }
    return $optional ? null : throw_fail('Invalid player session.', 403);
}

function touch_player(array $room, string $playerId): array
{
    foreach ($room['players'] as &$player) {
        if ($player['id'] === $playerId) {
            $player['connected'] = true;
            $player['lastSeenAt'] = time();
            break;
        }
    }
    unset($player);
    return $room;
}

function assert_lobby(array $room): void
{
    if (($room['status'] ?? '') !== 'lobby') {
        throw_fail('This room is no longer in the lobby.', 409);
    }
}

function assert_playing(array $room): void
{
    if (($room['status'] ?? '') !== 'playing') {
        throw_fail('This table is not playing right now.', 409);
    }
}

function assert_current_player(array $room, string $playerId): void
{
    $current = current_player($room);
    if (!$current || $current['id'] !== $playerId) {
        throw_fail('It is not your turn.', 403);
    }
}

function current_player(array $room): ?array
{
    $players = active_players($room);
    if (!$players) {
        return null;
    }
    $index = (int)($room['currentPlayerIndex'] ?? 0);
    return $players[$index % count($players)] ?? null;
}

function active_players(array $room): array
{
    return array_values(array_filter($room['players'], fn($player) => empty($player['left'])));
}

function player_name(array $room, string $playerId): string
{
    foreach ($room['players'] as $player) {
        if ($player['id'] === $playerId) {
            return (string)$player['name'];
        }
    }
    return 'Player';
}

function start_game(array $room): array
{
    $deck = make_deck();
    shuffle($deck);
    foreach ($room['players'] as &$player) {
        $player['hand'] = [];
        for ($i = 0; $i < THC_HAND_SIZE; $i += 1) {
            $player['hand'][] = array_pop($deck);
        }
    }
    unset($player);
    $top = array_pop($deck);
    while (($top['kind'] ?? '') === 'wild') {
        array_unshift($deck, $top);
        shuffle($deck);
        $top = array_pop($deck);
    }
    $room['deck'] = $deck;
    $room['discard'] = [$top];
    $room['currentColor'] = $top['color'];
    $room['currentPlayerIndex'] = 0;
    $room['direction'] = 1;
    $room['pendingDraw'] = 0;
    $room['winnerId'] = null;
    $room['status'] = 'playing';
    add_log($room, 'The table started. ' . player_name($room, current_player($room)['id']) . ' is first.');
    return $room;
}

function make_deck(): array
{
    $deck = [];
    foreach (THC_COLORS as $color) {
        for ($value = 0; $value <= 9; $value += 1) {
            $deck[] = card($color, 'number', (string)$value, ucfirst($color) . ' ' . $value);
            if ($value !== 0) {
                $deck[] = card($color, 'number', (string)$value, ucfirst($color) . ' ' . $value);
            }
        }
        foreach (['pack-two' => 'Pack Two', 'pass-the-tray' => 'Pass the Tray', 'rotation' => 'Rotation'] as $value => $label) {
            $deck[] = card($color, 'action', $value, $label);
            $deck[] = card($color, 'action', $value, $label);
        }
    }
    for ($i = 0; $i < 4; $i += 1) {
        $deck[] = card(null, 'wild', 'dealer-choice', 'Dealer Choice');
        $deck[] = card(null, 'wild', 'hotbox-plus-four', 'Hotbox +4');
    }
    return $deck;
}

function card(?string $color, string $kind, string $value, string $label): array
{
    return [
        'id' => 'c_' . bin2hex(random_bytes(5)),
        'color' => $color,
        'kind' => $kind,
        'value' => $value,
        'label' => $label,
    ];
}

function top_card(array $room): ?array
{
    return $room['discard'][count($room['discard']) - 1] ?? null;
}

function can_play_card(array $room, array $card): bool
{
    if (($card['kind'] ?? '') === 'wild') {
        return true;
    }
    $top = top_card($room);
    if (!$top) {
        return true;
    }
    return ($card['color'] ?? null) === ($room['currentColor'] ?? null)
        || ($card['value'] ?? null) === ($top['value'] ?? null);
}

function play_card(array &$room, string $playerId, string $cardId, ?string $chosenColor): void
{
    foreach ($room['players'] as &$player) {
        if ($player['id'] !== $playerId) {
            continue;
        }
        foreach ($player['hand'] as $index => $card) {
            if (($card['id'] ?? '') !== $cardId) {
                continue;
            }
            if (!can_play_card($room, $card)) {
                throw_fail('That card cannot be played on this discard.', 409);
            }
            if (($card['kind'] ?? '') === 'wild' && !$chosenColor) {
                throw_fail('Choose a color for that wild card.', 400);
            }
            array_splice($player['hand'], $index, 1);
            $room['discard'][] = $card;
            $room['currentColor'] = ($card['kind'] ?? '') === 'wild' ? $chosenColor : $card['color'];
            add_log($room, $player['name'] . ' played ' . $card['label'] . '.');
            if (count($player['hand']) === 0) {
                $room['winnerId'] = $playerId;
                $room['status'] = 'finished';
                add_log($room, $player['name'] . ' wins the round!');
                unset($player);
                return;
            }
            apply_card_effect($room, $card);
            unset($player);
            return;
        }
    }
    unset($player);
    throw_fail('That card is not in your hand.', 404);
}

function apply_card_effect(array &$room, array $card): void
{
    $skip = 0;
    $value = (string)($card['value'] ?? '');
    if ($value === 'rotation') {
        $room['direction'] = ((int)$room['direction']) * -1;
        add_log($room, 'Rotation changed direction.');
    } elseif ($value === 'pass-the-tray') {
        $skip = 1;
        add_log($room, 'The next player was skipped.');
    } elseif ($value === 'pack-two') {
        $room['pendingDraw'] = ((int)($room['pendingDraw'] ?? 0)) + 2;
        add_log($room, 'Draw penalty is now ' . $room['pendingDraw'] . '.');
    } elseif ($value === 'hotbox-plus-four') {
        $room['pendingDraw'] = ((int)($room['pendingDraw'] ?? 0)) + 4;
        add_log($room, 'Hotbox penalty is now ' . $room['pendingDraw'] . '.');
    }
    advance_turn($room, $skip);
}

function advance_turn(array &$room, int $extraSteps = 0): void
{
    $players = active_players($room);
    $count = count($players);
    if ($count < 1) {
        return;
    }
    $direction = (int)($room['direction'] ?? 1);
    $step = 1 + $extraSteps;
    $room['currentPlayerIndex'] = ((int)$room['currentPlayerIndex'] + ($direction * $step)) % $count;
    if ($room['currentPlayerIndex'] < 0) {
        $room['currentPlayerIndex'] += $count;
    }
}

function draw_cards_for_player(array &$room, string $playerId, int $amount): void
{
    foreach ($room['players'] as &$player) {
        if ($player['id'] !== $playerId) {
            continue;
        }
        for ($i = 0; $i < $amount; $i += 1) {
            if (count($room['deck']) < 1) {
                recycle_discard($room);
            }
            $card = array_pop($room['deck']);
            if ($card) {
                $player['hand'][] = $card;
            }
        }
        unset($player);
        return;
    }
    unset($player);
}

function recycle_discard(array &$room): void
{
    $top = array_pop($room['discard']);
    $room['deck'] = $room['discard'];
    $room['discard'] = [$top];
    shuffle($room['deck']);
}

function add_log(array &$room, string $message): void
{
    $room['log'][] = ['id' => bin2hex(random_bytes(4)), 'message' => $message, 'at' => time()];
    $room['log'] = array_slice($room['log'], -40);
}

function public_room(array $room, ?string $viewerId): array
{
    $viewerHand = [];
    foreach ($room['players'] as $player) {
        if ($player['id'] === $viewerId) {
            $viewerHand = $player['hand'] ?? [];
            break;
        }
    }
    return [
        'code' => $room['code'],
        'status' => $room['status'],
        'hostPlayerId' => $room['hostPlayerId'],
        'players' => array_map(fn($player) => [
            'id' => $player['id'],
            'name' => $player['name'],
            'host' => !empty($player['host']),
            'ready' => !empty($player['ready']),
            'connected' => !empty($player['connected']),
            'left' => !empty($player['left']),
            'handCount' => count($player['hand'] ?? []),
        ], active_players($room)),
        'currentPlayerId' => current_player($room)['id'] ?? null,
        'currentColor' => $room['currentColor'],
        'direction' => (int)($room['direction'] ?? 1),
        'pendingDraw' => (int)($room['pendingDraw'] ?? 0),
        'topCard' => top_card($room),
        'winnerId' => $room['winnerId'] ?? null,
        'hand' => $viewerHand,
        'log' => array_slice($room['log'] ?? [], -12),
        'updatedAt' => $room['updatedAt'] ?? time(),
    ];
}
