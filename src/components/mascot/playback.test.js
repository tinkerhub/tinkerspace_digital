import {
  enqueueEvent,
  getQueueDelay,
  getScheduledPoseDuration,
} from './playback';

const loopingPose = { cycle: 1000 };
const ambientPose = { cycle: 1000, kind: 'ambient' };
const oneShotPose = { cycle: 1000, playback: { cycles: 1, hold: { min: 200, max: 400 } } };
const durations = {
  ambient: { min: 20000, max: 45000 },
  home: { min: 35000, max: 90000 },
  pulse: { min: 2100, max: 4200 },
};

describe('mascot playback helpers', () => {
  it('keeps a one-shot recovery hold intact for queued events', () => {
    expect(getQueueDelay({
      pose: oneShotPose,
      poseStartedAt: 100,
      poseEndsAt: 1500,
      now: 900,
    })).toBe(600);
  });

  it('queues looping poses at their next frame cycle boundary', () => {
    expect(getQueueDelay({
      pose: loopingPose,
      poseStartedAt: 100,
      poseEndsAt: 0,
      now: 750,
    })).toBe(350);
  });

  it('uses one duration definition for normal and resumed ambient playback', () => {
    expect(getScheduledPoseDuration(ambientPose, durations, () => 42000)).toBe(42000);
    expect(getScheduledPoseDuration(oneShotPose, durations, () => 300)).toBe(1300);
  });

  it('deduplicates by semantic event key instead of reaction pose', () => {
    const makerJoin = { type: 'maker-join', dedupeKey: 'maker-join', reactionPose: 'dance' };
    const launchComplete = { type: 'launch-complete', dedupeKey: 'launch-complete', reactionPose: 'dance' };
    const latestMakerJoin = { ...makerJoin, payload: { count: 3 } };

    const queue = enqueueEvent(enqueueEvent([], makerJoin), launchComplete);
    expect(enqueueEvent(queue, latestMakerJoin)).toEqual([launchComplete, latestMakerJoin]);
  });
});
