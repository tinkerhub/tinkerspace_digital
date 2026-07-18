export const LOOPING_PLAYBACK = { cycles: Infinity };

/** Returns the explicit playback policy or the default infinite loop policy. */
export function getPlayback(pose) {
  return pose.playback || LOOPING_PLAYBACK;
}

/** Reports whether a pose has a finite playback cycle count. */
export function isOneShotPose(pose) {
  return Number.isFinite(getPlayback(pose).cycles);
}

/** Calculates the delay before the scheduler can advance a pose. */
export function getPoseDuration(pose, isHighEnergy, durations, randomDuration) {
  const playback = getPlayback(pose);
  if (Number.isFinite(playback.cycles)) {
    const hold = playback.hold
      ? randomDuration(playback.hold.min, playback.hold.max)
      : 0;
    return pose.cycle * playback.cycles + hold;
  }

  return isHighEnergy
    ? randomDuration(durations.pulse.min, durations.pulse.max)
    : randomDuration(durations.ambient.min, durations.ambient.max);
}

/** Adds a pose once and orders queued events by descending priority. */
export function enqueuePose(queue, pose, priority) {
  if (queue.some((event) => event.pose === pose)) return queue;

  return [...queue, { pose, priority }]
    .sort((left, right) => right.priority - left.priority);
}

/** Removes and returns the first queued pose that is currently eligible. */
export function takeEligiblePose(queue, isEligible) {
  const index = queue.findIndex(({ pose }) => isEligible(pose));
  if (index === -1) return { pose: null, queue };

  return {
    pose: queue[index].pose,
    queue: [...queue.slice(0, index), ...queue.slice(index + 1)],
  };
}

/** Waits for a one-shot to complete or a looping pose to reach its next boundary. */
export function getQueueDelay({ pose, poseStartedAt, poseEndsAt, now }) {
  if (isOneShotPose(pose) && poseEndsAt > now) {
    return poseEndsAt - now;
  }

  const elapsed = now - poseStartedAt;
  const remainingCycle = pose.cycle - (elapsed % pose.cycle);
  return remainingCycle || pose.cycle;
}

/** Chooses an eligible pose while reducing immediate category and pose repeats. */
export function chooseWeightedPose(candidates, poses, recentPoses, previousPose, random = Math.random) {
  const previousCategory = poses[previousPose]?.category;
  const weightedCandidates = candidates.map((pose) => {
    const definition = poses[pose];
    let weight = definition.weight ?? 1;

    if (previousCategory && definition.category === previousCategory) weight *= 0.2;
    if (recentPoses.includes(pose)) weight *= 0.35;
    if (definition.avoidAfter?.includes(previousCategory)) weight *= 0.2;

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
