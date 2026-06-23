# Invite Flow

THC U Know supports three invite methods from the first scaffold.

## 1. Invite link

The host shares:

```txt
https://dtfseeds.com/games/thc-u-know?join=SESSIONCODE
```

The browser reads the `join` query parameter and fills the Session Code field automatically.

## 2. Manual Session Code

Players can manually enter the Smoke Circle code shown in the lobby.

Example:

```txt
AB12CD
```

## 3. QR code

The web lobby renders a QR code for the invite link. This is useful for events, flyers, packaging, and in-person game nights.

## 4. Discord invite text

The lobby can copy a Discord command-style message:

```txt
/thc-u-know join code:AB12CD
```

The Discord bot scaffold currently returns web join links. Full Discord gameplay can be added later.

## Required hardening before public launch

- Add reconnect token persistence in local storage.
- Add room expiration cleanup.
- Add host transfer when host leaves.
- Add rate limits for chat and socket events.
- Add private room moderation controls.
