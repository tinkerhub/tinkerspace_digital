export const LOOPING_PLAYBACK = { cycles: Infinity };

/** Returns the explicit playback policy or the default infinite loop policy. */
export function getPlayback(pose) {
  return pose.playback || LOOPING_PLAYBACK;
}

/** Reports whether a pose has a finite playback cycle count. */
export function isOneShotPose(pose) {
  return Number.isFinite(getPlayback(pose).cycles);
}

/** Calculates the canonical delay before the policy can select another pose. */
export function getScheduledPoseDuration(pose, durations, randomDuration) {
  const playback = getPlayback(pose);
  if (Number.isFinite(playback.cycles)) {
    const hold = playback.hold
      ? randomDuration(playback.hold.min, playback.hold.max)
      : 0;
    return pose.cycle * playback.cycles + hold;
  }

  return pose.kind === 'ambient'
    ? randomDuration(durations.home.min, durations.home.max)
    : pose.energy === 'high'
    ? randomDuration(durations.pulse.min, durations.pulse.max)
    : randomDuration(durations.ambient.min, durations.ambient.max);
}

/** Replaces stale events with the latest event for each semantic dedupe key. */
export function enqueueEvent(queue, event) {
  const withoutDuplicate = queue.filter((queued) => queued.dedupeKey !== event.dedupeKey);
  return [...withoutDuplicate, event];
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
