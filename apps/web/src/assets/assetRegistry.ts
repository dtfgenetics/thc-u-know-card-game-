export const assetPaths = {
  cards: {
    back: '/assets/cards/card-back.svg',
    frontNumber: '/assets/cards/card-front-number.svg',
    frontAction: '/assets/cards/card-front-action.svg',
    frontWild: '/assets/cards/card-front-wild.svg',
    frontParty: '/assets/cards/card-front-party.svg'
  },
  logos: {
    thcUKnow: '/assets/logos/thc-u-know-logo.svg',
    dtfGenetics: '/assets/logos/dtf-genetics-logo.svg',
    favicon: '/assets/logos/favicon.svg'
  },
  ui: {
    tableBg: '/assets/ui/table-bg.svg',
    ashtrayBg: '/assets/ui/ashtray-bg.svg',
    stashBg: '/assets/ui/stash-bg.svg',
    winnerBadge: '/assets/ui/winner-badge.svg',
    playerToken: '/assets/ui/player-token.svg'
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
