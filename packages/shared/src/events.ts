export const Events = {
  SESSION_CREATE: 'session:create',
  SESSION_CREATED: 'session:created',
  SESSION_JOIN: 'session:join',
  SESSION_JOINED: 'session:joined',
  SESSION_REJOIN: 'session:rejoin',
  SESSION_LEAVE: 'session:leave',
  SESSION_KICK_PLAYER: 'session:kick-player',
  SESSION_UPDATE: 'session:update',
  GAME_START: 'game:start',
  GAME_STARTED: 'game:started',
  GAME_PUBLIC_STATE: 'game:public-state',
  GAME_PRIVATE_STATE: 'game:private-state',
  GAME_PLAY_CARD: 'game:play-card',
  GAME_DRAW_CARD: 'game:draw-card',
  GAME_END_TURN: 'game:end-turn',
  GAME_CHOOSE_STRAIN: 'game:choose-strain',
  GAME_CALL_THC_U_KNOW: 'game:call-thc-u-know',
  GAME_REMATCH: 'game:rematch',
  GAME_OVER: 'game:over',
  CHAT_SEND: 'chat:send',
  CHAT_RECEIVE: 'chat:receive',
  ERROR: 'error'
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
