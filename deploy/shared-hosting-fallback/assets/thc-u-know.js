const apiUrl = 'api/index.php';
const storageKey = 'thc-u-know-room-v2';
const colors = ['purple', 'green', 'gold', 'blue'];

let session = loadSession();
let room = null;
let selectedWild = null;
let polling = null;

const $ = (id) => document.getElementById(id);

const els = {
  setup: $('setup-view'),
  lobby: $('lobby-view'),
  game: $('game-view'),
  createForm: $('create-form'),
  joinForm: $('join-form'),
  createName: $('create-name'),
  joinName: $('join-name'),
  joinCode: $('join-code'),
  connection: $('connection-chip'),
  roomTitle: $('room-title'),
  roomSubtitle: $('room-subtitle'),
  roomCodePill: $('room-code-pill'),
  inviteLink: $('invite-link'),
  lobbyPlayers: $('lobby-players'),
  gamePlayers: $('game-players'),
  ready: $('ready-button'),
  start: $('start-button'),
  leaveLobby: $('leave-lobby'),
  leaveGame: $('leave-game'),
  copyInvite: $('copy-invite'),
  copyInviteGame: $('copy-invite-game'),
  refresh: $('refresh-state'),
  activeTurn: $('active-turn'),
  direction: $('direction-status'),
  discard: $('discard-card'),
  currentColor: $('current-color'),
  gameMessage: $('game-message'),
  pendingDraw: $('pending-draw'),
  draw: $('draw-button'),
  hand: $('hand'),
  handTitle: $('hand-title'),
  colorPicker: $('color-picker'),
  winnerPanel: $('winner-panel'),
  winnerText: $('winner-text'),
  newRoom: $('new-room'),
  error: $('error-box'),
  log: $('activity-log')
};

boot();

function boot() {
  const params = new URLSearchParams(window.location.search);
  const inviteCode = normalizeCode(params.get('room') || params.get('join') || '');
  if (inviteCode) els.joinCode.value = inviteCode;

  wireEvents();
  render();

  if (session?.code) {
    state().catch(() => {
      clearSession();
      render();
    });
  }
}

function wireEvents() {
  els.createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createRoom();
  });
  els.joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await joinRoom();
  });
  els.ready.addEventListener('click', async () => {
    const me = currentPlayer();
    await send('ready', { ready: !me?.ready });
  });
  els.start.addEventListener('click', async () => send('start'));
  els.draw.addEventListener('click', async () => send('draw'));
  els.leaveLobby.addEventListener('click', leaveRoom);
  els.leaveGame.addEventListener('click', leaveRoom);
  els.copyInvite.addEventListener('click', copyInvite);
  els.copyInviteGame.addEventListener('click', copyInvite);
  els.refresh.addEventListener('click', state);
  els.newRoom.addEventListener('click', () => {
    clearSession();
    window.location.href = window.location.pathname;
  });
}

async function createRoom() {
  const name = els.createName.value.trim();
  const response = await post({ action: 'create', name });
  accept(response);
  replaceRoomUrl(response.room.code);
}

async function joinRoom() {
  const name = els.joinName.value.trim();
  const code = normalizeCode(els.joinCode.value);
  if (!code) return showError('Enter a valid six-character room code.');
  const response = await post({ action: 'join', code, name });
  accept(response);
  replaceRoomUrl(response.room.code);
}

async function state() {
  if (!session?.code) return;
  const response = await post({ action: 'state', ...session });
  accept(response, false);
}

async function send(action, extra = {}) {
  if (!session?.code) return;
  const response = await post({ action, ...session, ...extra });
  accept(response);
}

async function post(body) {
  setConnection('connecting', 'Connecting');
  hideError();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error?.message || `Request failed with ${response.status}`);
  }
  setConnection('connected', 'Connected');
  return data;
}

function accept(response, restartPolling = true) {
  const nextRoom = response.room || (response.code ? response : null);
  if (response.session) {
    session = {
      code: nextRoom.code,
      playerId: response.session.playerId,
      token: response.session.token
    };
    saveSession();
  }
  if (nextRoom) room = nextRoom;
  render();
  if (restartPolling) startPolling();
}

function startPolling() {
  clearInterval(polling);
  if (!session?.code) return;
  polling = setInterval(() => state().catch((error) => setConnection('error', error.message)), 1800);
}

function render() {
  const hasRoom = Boolean(room && session);
  els.setup.classList.toggle('hidden', hasRoom);
  els.lobby.classList.toggle('hidden', !hasRoom || room.status !== 'lobby');
  els.game.classList.toggle('hidden', !hasRoom || room.status === 'lobby');

  if (!hasRoom) {
    setConnection('idle', 'Not connected');
    els.roomTitle.textContent = 'Create or join a room';
    els.roomSubtitle.textContent = 'No install, no account, just a private browser table.';
    els.roomCodePill.textContent = 'No room';
    renderLog([]);
    return;
  }

  const invite = inviteUrl(room.code);
  els.roomTitle.textContent = `Room ${room.code}`;
  els.roomSubtitle.textContent = room.status === 'lobby' ? 'Waiting for players to ready up.' : 'Game in progress.';
  els.roomCodePill.textContent = room.code;
  els.inviteLink.value = invite;
  renderPlayers();
  renderLog(room.log || []);

  if (room.status === 'lobby') renderLobby();
  if (room.status !== 'lobby') renderGame();
}

function renderLobby() {
  const me = currentPlayer();
  const allReady = room.players.length >= 2 && room.players.every((player) => player.ready);
  els.ready.textContent = me?.ready ? 'Mark Not Ready' : 'Mark Ready';
  els.start.disabled = !me?.host || !allReady;
  els.start.textContent = me?.host ? 'Start Game' : 'Waiting for host';
}

function renderPlayers() {
  const activeId = room.currentPlayerId;
  const playerHtml = room.players.map((player) => `
    <article class="player-pill ${player.id === activeId ? 'active' : ''}">
      <div>
        <strong>${escapeHtml(player.name)}${player.id === session?.playerId ? ' (You)' : ''}</strong>
        <small>${player.host ? 'Host' : 'Player'} / ${player.ready ? 'Ready' : 'Not ready'} / ${player.handCount} cards</small>
      </div>
      <span>${player.connected ? 'Online' : 'Away'}</span>
    </article>
  `).join('');
  els.lobbyPlayers.innerHTML = playerHtml;
  els.gamePlayers.innerHTML = playerHtml;
}

function renderGame() {
  const current = room.players.find((player) => player.id === room.currentPlayerId);
  const me = currentPlayer();
  const isMyTurn = room.currentPlayerId === session?.playerId && room.status === 'playing';
  const winner = room.players.find((player) => player.id === room.winnerId);

  els.activeTurn.textContent = winner ? 'Round over' : `${current?.name || 'Player'} to play`;
  els.direction.textContent = room.direction === -1 ? 'Counter-clockwise' : 'Clockwise';
  els.currentColor.textContent = room.currentColor || 'Wild';
  els.currentColor.className = `color-badge card-${room.currentColor || 'wild'}`;
  els.gameMessage.textContent = winner ? `${winner.name} wins!` : isMyTurn ? 'Your turn.' : `Waiting for ${current?.name || 'player'}.`;
  els.pendingDraw.textContent = room.pendingDraw > 0 ? `Pending draw: ${room.pendingDraw}` : 'No pending draw.';
  els.draw.disabled = !isMyTurn || Boolean(winner);
  els.handTitle.textContent = `${room.hand.length} cards`;
  els.winnerPanel.classList.toggle('hidden', !winner);
  els.winnerText.textContent = winner ? `${winner.name} wins THC U Know!` : '';
  renderDiscard(room.topCard);
  renderHand(isMyTurn);
  renderColorPicker();
}

function renderDiscard(card) {
  if (!card) {
    els.discard.textContent = 'THC';
    els.discard.className = 'game-card-display card-back';
    return;
  }
  els.discard.className = `game-card-display card-${card.color || 'wild'}`;
  els.discard.innerHTML = `<span>${escapeHtml(card.color || 'wild')}</span><strong>${escapeHtml(card.label)}</strong>`;
}

function renderHand(isMyTurn) {
  els.hand.innerHTML = room.hand.map((card) => {
    const playable = canPlay(card);
    return `
      <button class="hand-card card-${card.color || 'wild'} ${playable ? 'playable' : ''}" data-card-id="${card.id}" ${!isMyTurn || !playable ? 'disabled' : ''} type="button">
        <span>${escapeHtml(card.color || 'wild')}</span>
        <strong>${escapeHtml(card.label)}</strong>
      </button>
    `;
  }).join('');
  els.hand.querySelectorAll('[data-card-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const card = room.hand.find((entry) => entry.id === button.dataset.cardId);
      if (card?.kind === 'wild' && !selectedWild) {
        showError('Choose a color before playing a wild card.');
        els.colorPicker.classList.remove('hidden');
        return;
      }
      await send('play', { cardId: button.dataset.cardId, chosenColor: selectedWild });
      selectedWild = null;
    });
  });
}

function renderColorPicker() {
  els.colorPicker.innerHTML = colors.map((color) => `
    <button class="card-${color}" type="button" data-color="${color}">${color}</button>
  `).join('');
  els.colorPicker.querySelectorAll('[data-color]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedWild = button.dataset.color;
      hideError();
      els.colorPicker.classList.add('hidden');
    });
  });
}

function renderLog(entries) {
  els.log.innerHTML = entries.slice().reverse().map((entry) => `<li>${escapeHtml(entry.message)}</li>`).join('');
}

function canPlay(card) {
  if (card.kind === 'wild') return true;
  if (!room.topCard) return true;
  return card.color === room.currentColor || card.value === room.topCard.value;
}

function currentPlayer() {
  return room?.players.find((player) => player.id === session?.playerId) || null;
}

async function leaveRoom() {
  try {
    if (session?.code) await send('leave');
  } catch {}
  clearSession();
  window.location.href = window.location.pathname;
}

async function copyInvite() {
  const value = inviteUrl(room.code);
  await navigator.clipboard.writeText(value).catch(() => {});
}

function inviteUrl(code) {
  return `${window.location.origin}${window.location.pathname}?room=${code}`;
}

function replaceRoomUrl(code) {
  window.history.replaceState({}, '', `${window.location.pathname}?room=${code}`);
}

function setConnection(kind, label) {
  els.connection.className = `connection-chip ${kind}`;
  els.connection.textContent = label;
}

function showError(message) {
  els.error.textContent = message;
  els.error.classList.remove('hidden');
}

function hideError() {
  els.error.textContent = '';
  els.error.classList.add('hidden');
}

function normalizeCode(value) {
  const code = String(value || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return /^[A-HJ-NP-Z2-9]{6}$/.test(code) ? code : '';
}

function saveSession() {
  localStorage.setItem(storageKey, JSON.stringify(session));
}

function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return parsed?.code && parsed?.playerId && parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(storageKey);
  session = null;
  room = null;
  clearInterval(polling);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

window.addEventListener('unhandledrejection', (event) => {
  showError(event.reason?.message || 'Something went wrong.');
  setConnection('error', 'Needs attention');
});
