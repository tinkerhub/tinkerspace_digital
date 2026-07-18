export const POSES = {
  awakening: { image: '/images/mascot/dont-look/sprites/awakening.webp', cycle: 1200, label: 'TinkerHub mascot coming alive from its sticker', playback: { cycles: 1 }, transition: 'home' },
  returning: { image: '/images/mascot/dont-look/sprites/awakening.webp', cycle: 1200, label: 'TinkerHub mascot returning to life from its sticker', playback: { cycles: 1 }, transition: 'home' },
  ambientGlance: { image: '/images/mascot/dont-look/sprites/ambient-glance.webp', cycle: 8000, label: 'TinkerHub mascot resting in a beanbag', category: 'rest', kind: 'ambient', weight: 1, avoidAfter: ['recovery'] },
  ambientPeek: { image: '/images/mascot/dont-look/sprites/ambient-peek.webp', cycle: 8000, label: 'TinkerHub mascot peeking over a laptop', category: 'focus', kind: 'ambient', weight: 2 },
  ambientSun: {
    image: '/images/mascot/dont-look/sprites/sun.webp',
    cycle: 8000,
    label: 'TinkerHub mascot making a sunglasses flourish',
    playback: { cycles: 1, hold: { min: 1800, max: 3600 } },
    category: 'flourish',
    kind: 'flourish',
    weight: 0.6,
    transition: 'home',
  },
  rain: { image: '/images/mascot/dont-look/sprites/rain.webp', cycle: 4200, label: 'TinkerHub maker ready for rain', kind: 'weather', transition: 'home' },
  hot: { image: '/images/mascot/dont-look/sprites/hot.webp', cycle: 6000, label: 'TinkerHub maker managing the heat', kind: 'weather', transition: 'home' },
  winter: { image: '/images/mascot/dont-look/sprites/winter.webp', cycle: 6000, label: 'TinkerHub maker keeping warm', kind: 'weather', transition: 'home' },
  debug: { image: '/images/mascot/dont-look/sprites/debug.webp', cycle: 4200, label: 'TinkerHub maker debugging a bug', story: 'coding' },
  breakthrough: { image: '/images/mascot/dont-look/sprites/breakthrough.webp', cycle: 900, label: 'TinkerHub maker celebrating a code breakthrough', story: 'coding', energy: 'high', salientRole: 'story-payoff' },
  solder: {
    image: '/images/mascot/dont-look/sprites/solder.webp',
    cycle: 4200,
    label: 'TinkerHub maker reacting to a soldering mishap',
    playback: { cycles: 1, hold: { min: 1800, max: 3600 } },
    story: 'hardware',
  },
  fix: { image: '/images/mascot/dont-look/sprites/fix.webp', cycle: 4200, label: 'TinkerHub maker repairing a prototype', story: 'hardware' },
  show: { image: '/images/mascot/dont-look/sprites/show.webp', cycle: 4200, label: 'TinkerHub maker sharing a finished prototype', story: 'hardware' },
  dance: {
    image: '/images/mascot/dont-look/sprites/dance.webp',
    cycle: 900,
    label: 'TinkerHub maker dancing in celebration',
    playback: { cycles: 1, hold: { min: 1400, max: 2800 } },
    energy: 'high',
    salientRole: 'community-event',
    next: 'reset',
  },
  reset: {
    image: '/images/mascot/dont-look/sprites/reset.webp',
    cycle: 4200,
    label: 'TinkerHub maker resetting for the next build',
    playback: { cycles: 1, hold: { min: 2200, max: 4200 } },
    category: 'recovery',
    transition: 'home',
  },
};

// Stories declare the complete causal path; the policy does not name individual maker poses.
export const STORIES = {
  coding: {
    domain: 'coder',
    steps: ['debug', 'breakthrough'],
    recovery: 'reset',
    weight: 1,
    viewWeights: { calendar: 1.35 },
  },
  hardware: {
    domain: 'hardware',
    steps: ['solder', 'fix', 'show'],
    recovery: 'reset',
    weight: 1,
  },
};

// Named selectors keep policy rules independent from individual sprite files.
export const POLICY_SELECTORS = {
  homeBeat: Object.keys(POSES).filter((pose) => (
    POSES[pose].kind === 'ambient' || POSES[pose].kind === 'flourish'
  )),
  makerStories: Object.keys(STORIES),
};

export const PLAYBACK_DURATIONS = {
  pulse: { min: 2100, max: 4200 },
  ambient: { min: 20000, max: 45000 },
  home: { min: 35000, max: 90000 },
};

export const POLICY_LIMITS = {
  homeTurns: { min: 2, max: 3 },
  salientCooldown: { min: 45000, max: 60000 },
  weatherCooldown: 900000,
  stickerReturnCooldown: 60000,
  storiesPerStickerReturn: 2,
  recentPoseLimit: 3,
  sessionExposureLimit: 12,
};

export const EVENT_DEFINITIONS = {
  makerJoin: {
    type: 'maker-join',
    reactionPose: 'dance',
    dedupeKey: 'maker-join',
    priority: 1,
    cooldown: 'salient',
    expiresAfter: 120000,
  },
  weather: {
    type: 'weather',
    dedupeKey: 'weather',
    priority: 2,
    cooldown: 'weather',
    expiresAfter: 1200000,
  },
};

export const EVENT_POLICY = {
  priorityAgingInterval: 60000,
  priorityAgingCap: 2,
};
