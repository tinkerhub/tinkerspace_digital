import { POLICY_LIMITS, POLICY_SELECTORS, POSES, STORIES } from './manifest';
import { takeEligiblePose } from './playback';

/** Converts a weather payload into the matching mascot reaction pose. */
export function getWeatherPose(weather) {
  if (weather?.isRaining) return 'rain';
  if (weather?.temperature >= 32) return 'hot';
  if (weather?.temperature <= 24) return 'winter';
  return null;
}

/** Returns the maker domain represented by a pose, or neutral for bridges. */
export function getMakerDomain(pose) {
  return STORIES[POSES[pose]?.story]?.domain || 'neutral';
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
    || weightedCandidates[weightedCandidates.length - 1].pose;
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
    || weightedCandidates[weightedCandidates.length - 1].storyId;
}

/** Runs the priority policy and returns a pose plus the remaining event queue. */
export function decideNextPose(context, random = Math.random) {
  const continuation = getPoseContinuation(context.lastPose);
  if (continuation) {
    return { pose: continuation, queue: context.pendingEvents, reason: 'continue-path' };
  }

  const queued = takeEligiblePose(
    context.pendingEvents,
    (pose) => POSES[pose].energy !== 'high' || context.now >= context.nextSalientAt,
  );
  if (queued.pose) return { pose: queued.pose, queue: queued.queue, reason: 'queued-event' };

  const current = POSES[context.lastPose];

  const canReturnToSticker = context.lastPose === 'reset'
    && context.completedWorkStories >= POLICY_LIMITS.storiesPerStickerReturn
    && context.now - context.lastStickerReturnAt >= POLICY_LIMITS.stickerReturnCooldown;
  if (canReturnToSticker) return { pose: 'returning', queue: context.pendingEvents, reason: 'sticker-return' };

  if (current.transition === 'home') {
    return {
      pose: choosePolicyPose(POLICY_SELECTORS.homeBeat, context, random),
      queue: context.pendingEvents,
      reason: 'home-entry',
      home: {
        turns: 1,
        target: random() < 0.5 ? POLICY_LIMITS.homeTurns.min : POLICY_LIMITS.homeTurns.max,
      },
    };
  }

  if (current.kind === 'ambient') {
    if (context.homeTurns < context.homeTurnTarget) {
      return {
        pose: choosePolicyPose(POLICY_SELECTORS.homeBeat, context, random),
        queue: context.pendingEvents,
        reason: 'home-continue',
        home: { turns: context.homeTurns + 1, target: context.homeTurnTarget },
      };
    }
  }

  const storyId = chooseMakerStory(context, random);
  return {
    pose: STORIES[storyId].steps[0],
    queue: context.pendingEvents,
    reason: 'new-maker-story',
    home: { turns: 0, target: 0 },
  };
}
