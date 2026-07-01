const publicAsset = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const assetPaths = {
  cards: {
    back: publicAsset('assets/cards/card-back.svg'),
    frontNumber: publicAsset('assets/cards/card-front-number.svg'),
    frontAction: publicAsset('assets/cards/card-front-action.svg'),
    frontWild: publicAsset('assets/cards/card-front-wild.svg'),
    frontParty: publicAsset('assets/cards/card-front-party.svg')
  },
  logos: {
    thcUKnow: publicAsset('assets/logos/thc-u-know-logo.svg'),
    dtfGenetics: publicAsset('assets/logos/dtf-genetics-logo.svg'),
    favicon: publicAsset('assets/logos/favicon.svg')
  },
  ui: {
    tableBg: publicAsset('assets/ui/table-bg.svg'),
    ashtrayBg: publicAsset('assets/ui/ashtray-bg.svg'),
    stashBg: publicAsset('assets/ui/stash-bg.svg'),
    winnerBadge: publicAsset('assets/ui/winner-badge.svg'),
    playerToken: publicAsset('assets/ui/player-token.svg')
  },
  sounds: {
    cardPlay: publicAsset('assets/sounds/card-play.mp3'),
    cardDraw: publicAsset('assets/sounds/card-draw.mp3'),
    turnSkip: publicAsset('assets/sounds/turn-skip.mp3'),
    reverse: publicAsset('assets/sounds/reverse.mp3'),
    winRound: publicAsset('assets/sounds/win-round.mp3'),
    error: publicAsset('assets/sounds/error.mp3')
  },
  music: {
    tableLoop: publicAsset('assets/music/table-loop.mp3')
  }
} as const;

export type AssetPaths = typeof assetPaths;
