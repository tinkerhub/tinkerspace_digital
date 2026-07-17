export const BADGE_TYPES = {
  TEAM_MEMBER: 'Team-Member-Bronze',
  PROJECT_CONTRIBUTOR: 'Project-contributor',
  GUARD: 'guard'
};

export const USER_BADGES = {
  // Team Members
  'Harry Potter': [BADGE_TYPES.TEAM_MEMBER],
  'Ron Weasley': [BADGE_TYPES.TEAM_MEMBER],
  'Ginny Weasley': [BADGE_TYPES.TEAM_MEMBER],
  'Kurian Jacob': [BADGE_TYPES.TEAM_MEMBER],
  'Mehar M P': [BADGE_TYPES.TEAM_MEMBER],
  'Jasim C M': [BADGE_TYPES.TEAM_MEMBER],
  'User 1': [BADGE_TYPES.TEAM_MEMBER],
  
  // Project Contributors
  'Hermione Granger': [BADGE_TYPES.PROJECT_CONTRIBUTOR],
  'Luna Lovegood': [BADGE_TYPES.PROJECT_CONTRIBUTOR],
  
  // Guards
  'Rubeus Hagrid': [BADGE_TYPES.GUARD],
  'User 3': [BADGE_TYPES.GUARD]
};

export const BADGE_METADATA = {
  [BADGE_TYPES.TEAM_MEMBER]: {
    alt: 'Team Member',
    priority: 1
  },
  [BADGE_TYPES.PROJECT_CONTRIBUTOR]: {
    alt: 'Project Contributor',
    priority: 2
  },
  [BADGE_TYPES.GUARD]: {
    alt: 'Guard',
    priority: 3
  }
};
