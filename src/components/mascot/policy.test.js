import {
  chooseMakerStory,
  decideNextPose,
  choosePolicyPose,
  getPoseContinuation,
  getWeatherPose,
} from './policy';

const baseContext = {
  now: 100000,
  pendingEvents: [],
  lastPose: 'ambientPeek',
  recentPoses: [],
  sessionHistory: [],
  currentView: 'feed',
  lastCompletedWorkDomain: null,
  completedWorkStories: 0,
  lastStickerReturnAt: 0,
  nextSalientAt: 0,
  homeTurns: 0,
  homeTurnTarget: 0,
};

describe('mascot behaviour policy', () => {
  it('maps weather inputs to one meaningful reaction', () => {
    expect(getWeatherPose({ isRaining: true, temperature: 35 })).toBe('rain');
    expect(getWeatherPose({ temperature: 34 })).toBe('hot');
    expect(getWeatherPose({ temperature: 22 })).toBe('winter');
  });

  it('continues a causal maker story before choosing another behavior', () => {
    const decision = decideNextPose({ ...baseContext, lastPose: 'debug' });

    expect(decision).toMatchObject({ pose: 'breakthrough', reason: 'continue-path' });
  });

  it('uses manifest transitions for standalone beats', () => {
    expect(getPoseContinuation('dance')).toBe('reset');
  });

  it('defers a high-energy event until its cooldown ends', () => {
    const decision = decideNextPose({
      ...baseContext,
      pendingEvents: [{ pose: 'dance', priority: 1 }],
      nextSalientAt: baseContext.now + 1000,
    });

    expect(decision.pose).not.toBe('dance');
    expect(decision.queue).toEqual([{ pose: 'dance', priority: 1 }]);
  });

  it('finishes a configured story before releasing a queued event', () => {
    const debugDecision = decideNextPose({
      ...baseContext,
      lastPose: 'debug',
      pendingEvents: [{ pose: 'rain', priority: 2 }],
    });
    const breakthroughDecision = decideNextPose({
      ...baseContext,
      lastPose: 'breakthrough',
      pendingEvents: [{ pose: 'rain', priority: 2 }],
    });
    const resetDecision = decideNextPose({
      ...baseContext,
      lastPose: 'reset',
      pendingEvents: [{ pose: 'rain', priority: 2 }],
    });

    expect(debugDecision).toMatchObject({ pose: 'breakthrough', reason: 'continue-path' });
    expect(breakthroughDecision).toMatchObject({ pose: 'reset', reason: 'continue-path' });
    expect(resetDecision).toMatchObject({ pose: 'rain', reason: 'queued-event' });
  });

  it('returns to the sticker after the configured number of completed stories', () => {
    const decision = decideNextPose({
      ...baseContext,
      lastPose: 'reset',
      completedWorkStories: 2,
    });

    expect(decision).toMatchObject({ pose: 'returning', reason: 'sticker-return' });
  });

  it('alternates a new maker story after hardware work', () => {
    const decision = decideNextPose({
      ...baseContext,
      lastPose: 'ambientPeek',
      homeTurns: 2,
      homeTurnTarget: 2,
      lastCompletedWorkDomain: 'hardware',
    });

    expect(decision).toMatchObject({ pose: 'debug', reason: 'new-maker-story' });
  });

  it('discovers alternate maker stories from the manifest', () => {
    expect(chooseMakerStory({ ...baseContext, lastCompletedWorkDomain: 'hardware' }, () => 0))
      .toBe('coding');
  });

  it('reduces a pose weight after repeated session exposure', () => {
    const context = {
      ...baseContext,
      lastPose: 'reset',
      sessionHistory: ['ambientPeek', 'ambientPeek', 'ambientPeek', 'ambientPeek'],
    };

    expect(choosePolicyPose(['ambientPeek', 'ambientGlance'], context, () => 0.9)).toBe('ambientGlance');
  });
});
