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

function eventAt(baseDate, dayOffset, hours, minutes = 0, durationMinutes = 60) {
  const startDate = new Date(baseDate);
  startDate.setDate(baseDate.getDate() + dayOffset);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  return {
    startDate: toIso(startDate),
    endDate: toIso(endDate),
  };
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 9, 0, 0, 0);
}

function getMockMakers() {
  return MOCK_MAKERS;
}

/**
 * Raw event fixtures shaped like the real TinkerHub `/v1/public/event/all`
 * response — deliberately spanning multiple spaceId values (including
 * `null`, like real online/group events) so local dev actually exercises
 * the client-side space filter instead of trusting a server-side one.
 */
function getMockEvents(now = new Date()) {
  const monthAnchor = startOfMonth(now);
  let nextId = 1;
  const id = () => nextId++;

  const events = [
    // Live right now, for TinkerSpace id 1 (the default)
    {
      name: 'Dueling Club: Practical Defense Lab',
      type: 'Talk_Session',
      spaceId: 1,
      ...(() => {
        const startDate = new Date(now);
        startDate.setMinutes(startDate.getMinutes() - 20, 0, 0);
        const endDate = new Date(now);
        endDate.setMinutes(endDate.getMinutes() + 70, 0, 0);
        return { startDate: toIso(startDate), endDate: toIso(endDate) };
      })(),
    },
    { name: 'Marauders Workshop: Enchanted Map Interfaces', type: 'Workshop', spaceId: 1, ...eventAt(now, 1, 18, 30, 90) },
    { name: 'Common Room Open House for New Students', type: 'Community', spaceId: 1, ...eventAt(now, 2, 16, 0, 120) },
    { name: 'Potions Clinic: Fine-Tuning Draught Ratios', type: 'Research', spaceId: 1, ...eventAt(now, 4, 17, 0, 120) },
    { name: 'Quidditch Night: Build a Match Tracker', type: 'Meetup', spaceId: 1, ...eventAt(now, 6, 18, 0, 150) },
    { name: 'Charms Lab: Intro to Feather Levitation', type: 'Learning_Program', spaceId: 1, ...eventAt(now, 8, 11, 0, 120) },
    { name: 'Great Hall Forum: What Should Hogwarts Build Next?', type: 'Community', spaceId: 1, ...eventAt(now, 10, 19, 0, 90) },
    { name: 'Forbidden Forest Field Bootcamp', type: 'Bootcamp', spaceId: 1, ...eventAt(monthAnchor, 3, 18, 30, 120) },
    { name: 'Order of the Phoenix Build Circle', type: 'Meetup', spaceId: 1, ...eventAt(monthAnchor, 5, 17, 30, 120) },
    { name: 'Triwizard Hack Night Warmup', type: 'Hackathon', spaceId: 1, ...eventAt(monthAnchor, 17, 18, 0, 180) },

    // A different physical TinkerSpace (id 2) — should be filtered out
    // when the display is configured for space 1.
    { name: 'Hogsmeade Community Sync', type: 'Meetup', spaceId: 2, ...eventAt(monthAnchor, 8, 16, 0, 60) },
    { name: 'Rapid Broom Prototype Lab', type: 'Workshop', spaceId: 2, ...eventAt(monthAnchor, 10, 14, 0, 150) },

    // Online/group programs not tied to any physical space — mirrors the
    // real API always returning `spaceId: null` for these.
    { name: 'O.W.L. Portfolio Clinic', type: 'Learning_Program', spaceId: null, ...eventAt(monthAnchor, 20, 17, 0, 90) },
    { name: 'Wizarding Community Film Night', type: 'Community', spaceId: null, ...eventAt(monthAnchor, 24, 19, 0, 120) },

    // Unpublished — should never reach the display regardless of space.
    { name: 'Draft: Department of Mysteries Demo Review', type: 'Research', spaceId: 1, status: 'draft', ...eventAt(monthAnchor, 15, 15, 0, 120) },
  ];

  return events.map((event) => ({
    id: id(),
    status: 'published',
    ...event,
  }));
}

module.exports = {
  getMockMakers,
  getMockEvents,
};
