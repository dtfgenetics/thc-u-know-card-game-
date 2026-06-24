export const assetPaths = {
  cards: {
    back: '/assets/cards/card-back.png',
    frontNumber: '/assets/cards/card-front-number.png',
    frontAction: '/assets/cards/card-front-action.png',
    frontWild: '/assets/cards/card-front-wild.png',
    frontParty: '/assets/cards/card-front-party.png'
  },
  logos: {
    thcUKnow: '/assets/logos/thc-u-know-logo.png',
    dtfGenetics: '/assets/logos/dtf-genetics-logo.png',
    favicon: '/assets/logos/favicon.png'
  },
  ui: {
    tableBg: '/assets/ui/table-bg.png',
    ashtrayBg: '/assets/ui/ashtray-bg.png',
    stashBg: '/assets/ui/stash-bg.png',
    winnerBadge: '/assets/ui/winner-badge.png',
    playerToken: '/assets/ui/player-token.png'
  },
  sounds: {
    cardPlay: '/assets/sounds/card-play.mp3',
    cardDraw: '/assets/sounds/card-draw.mp3',
    turnSkip: '/assets/sounds/turn-skip.mp3',
    reverse: '/assets/sounds/reverse.mp3',
    winRound: '/assets/sounds/win-round.mp3',
    error: '/assets/sounds/error.mp3'
  },
  music: {
    tableLoop: '/assets/music/table-loop.mp3'
  }
} as const;

export type AssetPaths = typeof assetPaths;
