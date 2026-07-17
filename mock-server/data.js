const MOCK_MAKERS = [
  {
    membershipId: 'mk-001',
    name: 'Harry Potter',
    purpose: 'Working on a project',
    workingOn: 'Marauder Map refresh',
    avatar: '',
  },
  {
    membershipId: 'mk-002',
    name: 'Hermione Granger',
    purpose: 'Self Learning',
    workingOn: 'Advanced arithmancy notes',
    avatar: '',
  },
  {
    membershipId: 'mk-003',
    name: 'Rubeus Hagrid',
    purpose: 'On duty',
    workingOn: 'Care of magical creatures desk',
    avatar: '',
  },
  {
    membershipId: 'mk-004',
    name: 'Luna Lovegood',
    purpose: 'Attending an event',
    workingOn: 'Spectrespecs prototyping night',
    avatar: '',
  },
  {
    membershipId: 'mk-005',
    name: 'Ron Weasley',
    purpose: 'Working on a project',
    projectName: 'Wizard chess scoreboard',
    avatar: '',
  },
  {
    membershipId: 'mk-006',
    name: 'Ginny Weasley',
    purpose: 'Visiting',
    workingOn: 'Daily Prophet open house',
    avatar: '',
  },
];

function toIso(date) {
  return date.toISOString();
}

function atTime(baseDate, dayOffset, hours, minutes = 0, durationMinutes = 60) {
  const startsAt = new Date(baseDate);
  startsAt.setDate(baseDate.getDate() + dayOffset);
  startsAt.setHours(hours, minutes, 0, 0);

  const endsAt = new Date(startsAt);
  endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

  return {
    starts_at: toIso(startsAt),
    ends_at: toIso(endsAt),
  };
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 9, 0, 0, 0);
}

function getMockMakers() {
  return MOCK_MAKERS;
}

function getMockCalendarDisplay(now = new Date()) {
  const monthAnchor = startOfMonth(now);

  const liveStartsAt = new Date(now);
  liveStartsAt.setMinutes(liveStartsAt.getMinutes() - 20, 0, 0);
  const liveEndsAt = new Date(now);
  liveEndsAt.setMinutes(liveEndsAt.getMinutes() + 70, 0, 0);

  return {
    live_event: {
      id: 'live-dueling-club',
      title: 'Dueling Club: Practical Defense Lab',
      category: 'Talk',
      status: 'ongoing',
      starts_at: toIso(liveStartsAt),
      ends_at: toIso(liveEndsAt),
    },
    upcoming_events: [
      {
        id: 'upcoming-marauders-workshop',
        title: 'Marauders Workshop: Enchanted Map Interfaces',
        category: 'Workshop',
        status: 'upcoming',
        ...atTime(now, 1, 18, 30, 90),
      },
      {
        id: 'upcoming-common-room-open-house',
        title: 'Common Room Open House for New Students',
        category: 'Community',
        status: 'upcoming',
        ...atTime(now, 2, 16, 0, 120),
      },
      {
        id: 'upcoming-potions-clinic',
        title: 'Potions Clinic: Fine-Tuning Draught Ratios',
        category: 'Research',
        status: 'upcoming',
        ...atTime(now, 4, 17, 0, 120),
      },
      {
        id: 'upcoming-quidditch-night',
        title: 'Quidditch Night: Build a Match Tracker',
        category: 'Meetup',
        status: 'upcoming',
        ...atTime(now, 6, 18, 0, 150),
      },
      {
        id: 'upcoming-charms-lab',
        title: 'Charms Lab: Intro to Feather Levitation',
        category: 'Learning Program',
        status: 'upcoming',
        ...atTime(now, 8, 11, 0, 120),
      },
      {
        id: 'upcoming-great-hall-forum',
        title: 'Great Hall Forum: What Should Hogwarts Build Next?',
        category: 'Community',
        status: 'upcoming',
        ...atTime(now, 10, 19, 0, 90),
      },
    ],
    calendar: [
      {
        id: 'calendar-01',
        title: 'Defense Against the Dark Arts Studio',
        category: 'Talk',
        status: 'upcoming',
        ...atTime(monthAnchor, 2, 18, 0, 120),
      },
      {
        id: 'calendar-02',
        title: 'Forbidden Forest Field Workshop',
        category: 'Workshop',
        status: 'upcoming',
        ...atTime(monthAnchor, 3, 18, 30, 120),
      },
      {
        id: 'calendar-03',
        title: 'Order of the Phoenix Build Circle',
        category: 'Meetup',
        status: 'upcoming',
        ...atTime(monthAnchor, 5, 17, 30, 120),
      },
      {
        id: 'calendar-04',
        title: 'Hogsmeade Community Sync',
        category: 'Community',
        status: 'upcoming',
        ...atTime(monthAnchor, 8, 16, 0, 60),
      },
      {
        id: 'calendar-05',
        title: 'Rapid Broom Prototype Lab',
        category: 'Workshop',
        status: 'upcoming',
        ...atTime(monthAnchor, 10, 14, 0, 150),
      },
      {
        id: 'calendar-06',
        title: 'Great Hall Open House',
        category: 'General Event',
        status: 'upcoming',
        ...atTime(monthAnchor, 12, 11, 0, 180),
      },
      {
        id: 'calendar-07',
        title: 'Department of Mysteries Demo Review',
        category: 'Research',
        status: 'upcoming',
        ...atTime(monthAnchor, 15, 15, 0, 120),
      },
      {
        id: 'calendar-08',
        title: 'Triwizard Hack Night Warmup',
        category: 'Hackathon',
        status: 'upcoming',
        ...atTime(monthAnchor, 17, 18, 0, 180),
      },
      {
        id: 'calendar-09',
        title: 'O.W.L. Portfolio Clinic',
        category: 'Learning Program',
        status: 'upcoming',
        ...atTime(monthAnchor, 20, 17, 0, 90),
      },
      {
        id: 'calendar-10',
        title: 'Wizarding Community Film Night',
        category: 'Community',
        status: 'upcoming',
        ...atTime(monthAnchor, 24, 19, 0, 120),
      },
    ],
    generated_at: toIso(now),
    api_version: 'mock-1',
  };
}

module.exports = {
  getMockMakers,
  getMockCalendarDisplay,
};
