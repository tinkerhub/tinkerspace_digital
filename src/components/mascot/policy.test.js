import {
  chooseMakerStory,
  choosePolicyPose,
  decideNextPose,
  getEffectiveEventPriority,
  getWeatherPose,
} from './policy';

const baseContext = {
  now: 1000000,
  pendingEvents: [],
  lastPose: 'ambientPeek',
  recentPoses: [],
  sessionHistory: [],
  currentView: 'feed',
  lastCompletedWorkDomain: null,
  completedWorkStories: 0,
  lastStickerReturnAt: 0,
  nextSalientAt: 0,
  lastWeatherReactionAt: -1000000,
  homeTurns: 0,
  homeTurnTarget: 0,
};

function event(overrides) {
  return {
    type: 'maker-join',
    dedupeKey: 'maker-join',
    reactionPose: 'dance',
    priority: 1,
    cooldown: 'salient',
    createdAt: baseContext.now,
    expiresAt: baseContext.now + 120000,
    ...overrides,
  };
}

describe('mascot behaviour policy', () => {
  it('maps weather inputs to one meaningful reaction', () => {
    expect(getWeatherPose({ isRaining: true, temperature: 35 })).toBe('rain');
    expect(getWeatherPose({ temperature: 34 })).toBe('hot');
    expect(getWeatherPose({ temperature: 22 })).toBe('winter');
  });

  it('enters a configured two-or-three-turn home sequence after awakening', () => {
    const decision = decideNextPose({
      ...baseContext,
      lastPose: 'awakening',
      preferHomeEntry: true,
      pendingEvents: [event({ type: 'weather', dedupeKey: 'weather', reactionPose: 'rain', priority: 2 })],
    }, () => 0);

    expect(decision.reason).toBe('home-entry');
    expect(decision.home).toEqual({ turns: 1, target: 2 });
  });

  it('continues a causal story and declares completion as an effect', () => {
    const debug = decideNextPose({ ...baseContext, lastPose: 'debug' });
    const breakthrough = decideNextPose({ ...baseContext, lastPose: 'breakthrough' });

    expect(debug).toMatchObject({ pose: 'breakthrough', reason: 'continue-path' });
    expect(breakthrough).toMatchObject({
      pose: 'reset',
      effects: { storyCompleted: 'coder' },
    });
  });

  it('holds a blocked celebration in low-salience home behavior', () => {
    const decision = decideNextPose({
      ...baseContext,
      pendingEvents: [event()],
      nextSalientAt: baseContext.now + 5000,
      homeTurns: 2,
      homeTurnTarget: 2,
    });

    expect(decision).toMatchObject({ reason: 'await-event' });
    expect(decision.pose).not.toBe('debug');
    expect(decision.queue).toEqual([event()]);
  });

  it('applies weather cooldown inside the policy', () => {
    const weatherEvent = event({
      type: 'weather',
      dedupeKey: 'weather',
      reactionPose: 'rain',
      priority: 2,
      cooldown: 'weather',
    });
    const blocked = decideNextPose({
      ...baseContext,
      pendingEvents: [weatherEvent],
      lastWeatherReactionAt: baseContext.now - 1000,
      homeTurns: 2,
      homeTurnTarget: 2,
    });
    const eligible = decideNextPose({
      ...baseContext,
      pendingEvents: [weatherEvent],
      homeTurns: 2,
      homeTurnTarget: 2,
    });

    expect(blocked.reason).toBe('await-event');
    expect(eligible).toMatchObject({ pose: 'rain', reason: 'queued-event' });
  });

  it('ages valid events and discards malformed or expired events', () => {
    const older = event({ createdAt: baseContext.now - 120000 });
    const stale = event({ dedupeKey: 'stale', expiresAt: baseContext.now - 1 });
    const malformed = event({ dedupeKey: 'bad', reactionPose: 'missing-pose' });
    const invalidTiming = event({ dedupeKey: 'invalid-timing', createdAt: Number.NaN });
    const invalidPriority = event({ dedupeKey: 'invalid-priority', priority: Number.POSITIVE_INFINITY });
    const decision = decideNextPose({
      ...baseContext,
      pendingEvents: [stale, malformed, invalidTiming, invalidPriority, older],
    });

    expect(getEffectiveEventPriority(older, baseContext.now)).toBe(3);
    expect(decision).toMatchObject({ pose: 'dance', reason: 'queued-event' });
    expect(decision.queue).toEqual([]);
  });

  it('does not reduce event priority when its timestamp is in the future', () => {
    const futureEvent = event({ createdAt: baseContext.now + 120000 });

    expect(getEffectiveEventPriority(futureEvent, baseContext.now)).toBe(futureEvent.priority);
  });

  it('uses a safe fallback when the current pose is invalid', () => {
    const decision = decideNextPose({ ...baseContext, lastPose: 'invalid-pose' }, () => 0);

    expect(decision).toMatchObject({ pose: 'ambientPeek', reason: 'fallback' });
  });

  it('alternates new maker stories and reduces repeated session exposure', () => {
    expect(chooseMakerStory({ ...baseContext, lastCompletedWorkDomain: 'hardware' }, () => 0))
      .toBe('coding');

    const context = {
      ...baseContext,
      lastPose: 'reset',
      sessionHistory: ['ambientPeek', 'ambientPeek', 'ambientPeek', 'ambientPeek'],
    };
    expect(choosePolicyPose(['ambientPeek', 'ambientGlance'], context, () => 0.9))
      .toBe('ambientGlance');
  });
});
