import {
  enqueuePose,
  getPoseDuration,
  getQueueDelay,
  takeEligiblePose,
} from './playback';

const loopingPose = { cycle: 1000 };
const oneShotPose = { cycle: 1000, playback: { cycles: 1, hold: { min: 200, max: 400 } } };

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

  it('deduplicates events and preserves priority', () => {
    const queued = enqueuePose([], 'dance', 1);
    const prioritised = enqueuePose(queued, 'rain', 2);
    const deduplicated = enqueuePose(prioritised, 'dance', 1);

    expect(deduplicated.map((event) => event.pose)).toEqual(['rain', 'dance']);
  });

  it('keeps ineligible events queued until their cooldown ends', () => {
    const queued = [{ pose: 'rain', priority: 2 }, { pose: 'dance', priority: 1 }];
    const selection = takeEligiblePose(queued, (pose) => pose === 'rain');

    expect(selection.pose).toBe('rain');
    expect(selection.queue).toEqual([{ pose: 'dance', priority: 1 }]);
  });

  it('includes a randomized recovery hold in one-shot duration', () => {
    expect(getPoseDuration(oneShotPose, false, {}, () => 300)).toBe(1300);
  });

});
