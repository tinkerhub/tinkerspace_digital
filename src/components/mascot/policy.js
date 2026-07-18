import {
  EVENT_POLICY,
  POLICY_LIMITS,
  POLICY_SELECTORS,
  POSES,
  STORIES,
} from './manifest';

export const FALLBACK_POSE = 'ambientPeek';

/** Converts a weather payload into the matching mascot reaction pose. */
export function getWeatherPose(weather) {
  if (weather?.isRaining) return 'rain';
  if (weather?.temperature >= 32) return 'hot';
  if (weather?.temperature <= 24) return 'winter';
  return null;
}

/** Returns the next configured step of a causal story, including recovery. */
export function getStoryContinuation(pose) {
  const story = STORIES[POSES[pose]?.story];
  if (!story) return null;

  const index = story.steps.indexOf(pose);
  if (index === -1) return null;
  return story.steps[index + 1] || story.recovery;
}

/** Returns a manifest-defined continuation for stories and standalone beats. */
export function getPoseContinuation(pose) {
  return getStoryContinuation(pose) || POSES[pose]?.next || null;
}

/** Counts bounded exposure history so selectors can avoid a visible playlist. */
export function getExposureCounts(history) {
  return history.reduce((counts, pose) => {
    counts[pose] = (counts[pose] || 0) + 1;
    return counts;
  }, {});
}

/** Selects a valid pose while balancing immediate recency and session exposure. */
export function choosePolicyPose(candidates, context, random = Math.random) {
  const previousCategory = POSES[context.lastPose]?.category;
  const exposure = getExposureCounts(context.sessionHistory);
  const weightedCandidates = candidates.map((pose) => {
    const definition = POSES[pose];
    let weight = definition.weight ?? 1;

    if (previousCategory && definition.category === previousCategory) weight *= 0.2;
    if (context.recentPoses.includes(pose)) weight *= 0.35;
    if (definition.avoidAfter?.includes(previousCategory)) weight *= 0.2;
    weight /= 1 + (exposure[pose] || 0) * 0.45;

    return { pose, weight };
  });
  const totalWeight = weightedCandidates.reduce((total, candidate) => total + candidate.weight, 0);
  let threshold = random() * totalWeight;

  for (const candidate of weightedCandidates) {
    threshold -= candidate.weight;
    if (candidate.weight > 0 && threshold <= 0) return candidate.pose;
  }

  return weightedCandidates.find((candidate) => candidate.weight > 0)?.pose
    || FALLBACK_POSE;
}

/** Selects a configured maker story without repeating the completed domain. */
export function chooseMakerStory(context, random = Math.random) {
  const candidates = POLICY_SELECTORS.makerStories.filter((storyId) => (
    STORIES[storyId].domain !== context.lastCompletedWorkDomain
  ));
  const eligibleStories = candidates.length ? candidates : POLICY_SELECTORS.makerStories;
  const storyExposure = context.sessionHistory.reduce((counts, pose) => {
    const storyId = POSES[pose]?.story;
    if (storyId) counts[storyId] = (counts[storyId] || 0) + 1;
    return counts;
  }, {});
  const weightedCandidates = eligibleStories.map((storyId) => {
    const story = STORIES[storyId];
    let weight = story.weight ?? 1;
    weight *= story.viewWeights?.[context.currentView] ?? 1;
    weight /= 1 + (storyExposure[storyId] || 0) * 0.45;
    return { storyId, weight };
  });
  const totalWeight = weightedCandidates.reduce((total, candidate) => total + candidate.weight, 0);
  let threshold = random() * totalWeight;

  for (const candidate of weightedCandidates) {
    threshold -= candidate.weight;
    if (candidate.weight > 0 && threshold <= 0) return candidate.storyId;
  }

  return weightedCandidates.find((candidate) => candidate.weight > 0)?.storyId
    || POLICY_SELECTORS.makerStories[0];
}

/** Rejects malformed or expired events before they reach the decision tree. */
export function sanitizeEvents(events, now) {
  return events.filter((event) => (
    event
    && typeof event.type === 'string'
    && typeof event.dedupeKey === 'string'
    && typeof event.createdAt === 'number'
    && typeof event.expiresAt === 'number'
    && event.expiresAt > now
    && POSES[event.reactionPose]
  ));
}

/** Computes priority with a bounded age bonus so older valid events are not starved. */
export function getEffectiveEventPriority(event, now) {
  const ageBonus = Math.min(
    EVENT_POLICY.priorityAgingCap,
    Math.floor((now - event.createdAt) / EVENT_POLICY.priorityAgingInterval),
  );
  return event.priority + ageBonus;
}

/** Keeps event cooldown eligibility inside the policy boundary. */
export function isEventEligible(event, context) {
  if (event.cooldown === 'salient') return context.now >= context.nextSalientAt;
  if (event.cooldown === 'weather') {
    return context.now - context.lastWeatherReactionAt >= POLICY_LIMITS.weatherCooldown;
  }
  return true;
}

/** Returns the current valid event queue ordered by effective priority. */
export function getQueuedEvents(context) {
  return sanitizeEvents(context.pendingEvents, context.now)
    .sort((left, right) => getEffectiveEventPriority(right, context.now) - getEffectiveEventPriority(left, context.now));
}

function homeDecision(context, random, reason, home) {
  return {
    pose: choosePolicyPose(POLICY_SELECTORS.homeBeat, context, random),
    queue: getQueuedEvents(context),
    reason,
    home,
  };
}

/** Branch 1: preserve a configured causal sequence and declare completion semantically. */
export function continueActivePath(context) {
  const continuation = getPoseContinuation(context.lastPose);
  if (!continuation) return null;

  const story = STORIES[POSES[context.lastPose]?.story];
  const completesStory = story && continuation === story.recovery;
  return {
    pose: continuation,
    queue: getQueuedEvents(context),
    reason: 'continue-path',
    effects: completesStory ? { storyCompleted: story.domain } : undefined,
  };
}

/** Branch 2: release the highest-priority event whose policy cooldown has expired. */
export function playEligibleQueuedEvent(context) {
  if (context.preferHomeEntry) return null;

  const queue = getQueuedEvents(context);
  const event = queue.find((candidate) => isEventEligible(candidate, context));
  if (!event) return null;

  return {
    pose: event.reactionPose,
    queue: queue.filter((candidate) => candidate !== event),
    reason: 'queued-event',
    effects: { eventPlayed: event },
  };
}

/** Branch 3: return to the sticker only after the configured story guard passes. */
export function returnToSticker(context) {
  const eligible = context.lastPose === 'reset'
    && context.completedWorkStories >= POLICY_LIMITS.storiesPerStickerReturn
    && context.now - context.lastStickerReturnAt >= POLICY_LIMITS.stickerReturnCooldown;
  if (!eligible) return null;

  return {
    pose: 'returning',
    queue: getQueuedEvents(context),
    reason: 'sticker-return',
    effects: { stickerReturned: true },
  };
}

/** Branch 4: enter the configured home sequence after a home-transition pose. */
export function enterHome(context, random) {
  const current = POSES[context.lastPose];
  if (current?.transition !== 'home') return null;

  return homeDecision(context, random, 'home-entry', {
    turns: 1,
    target: random() < 0.5 ? POLICY_LIMITS.homeTurns.min : POLICY_LIMITS.homeTurns.max,
  });
}

/** Branch 5: stay low-salience while a valid event is waiting for its cooldown. */
export function waitForBlockedEvent(context, random) {
  const hasBlockedEvent = getQueuedEvents(context).some((event) => !isEventEligible(event, context));
  if (!hasBlockedEvent) return null;

  return homeDecision(context, random, 'await-event', {
    turns: Math.max(1, context.homeTurns),
    target: Math.max(1, context.homeTurnTarget),
  });
}

/** Branch 6: continue the configured home sequence. */
export function continueHome(context, random) {
  const current = POSES[context.lastPose];
  if (current?.kind !== 'ambient' || context.homeTurns >= context.homeTurnTarget) return null;

  return homeDecision(context, random, 'home-continue', {
    turns: context.homeTurns + 1,
    target: context.homeTurnTarget,
  });
}

/** Branch 7: begin an eligible manifest-defined maker story. */
export function startMakerStory(context, random) {
  const storyId = chooseMakerStory(context, random);
  return {
    pose: STORIES[storyId].steps[0],
    queue: getQueuedEvents(context),
    reason: 'new-maker-story',
    home: { turns: 0, target: 0 },
  };
}

export const POLICY_BRANCHES = [
  continueActivePath,
  playEligibleQueuedEvent,
  returnToSticker,
  enterHome,
  waitForBlockedEvent,
  continueHome,
  startMakerStory,
];

/** Runs the event-bound priority policy and returns a pose plus semantic effects. */
export function decideNextPose(context, random = Math.random) {
  const queue = sanitizeEvents(context.pendingEvents, context.now);
  if (!POSES[context.lastPose]) {
    return { pose: FALLBACK_POSE, queue, reason: 'fallback' };
  }

  const safeContext = {
    ...context,
    pendingEvents: queue,
  };

  for (const branch of POLICY_BRANCHES) {
    const decision = branch(safeContext, random);
    if (decision) return decision;
  }

  return { pose: FALLBACK_POSE, queue: safeContext.pendingEvents, reason: 'fallback' };
}
