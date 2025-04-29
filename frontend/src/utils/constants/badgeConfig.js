export const BADGE_TYPES = {
  TEAM_MEMBER: 'Team-Member-Bronze',
  PROJECT_CONTRIBUTOR: 'Project-contributor',
  GUARD: 'quard'
};

export const USER_BADGES = {
  // Team Members
  'Reema Shaji': [BADGE_TYPES.TEAM_MEMBER],
  'Johnson Regi': [BADGE_TYPES.TEAM_MEMBER],
  'Arundhathi Krishna': [BADGE_TYPES.TEAM_MEMBER],
  'Kurian Jacob': [BADGE_TYPES.TEAM_MEMBER],
  'Mehar M P': [BADGE_TYPES.TEAM_MEMBER],
  'User 1': [BADGE_TYPES.TEAM_MEMBER],
  
  // Project Contributors
  'Imad Ibrahim': [BADGE_TYPES.PROJECT_CONTRIBUTOR],
  'User 2': [BADGE_TYPES.PROJECT_CONTRIBUTOR],
  
  // Guards
  'Chandran P K': [BADGE_TYPES.GUARD],
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