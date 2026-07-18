import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWeather } from '../../utils/api/weatherService';
import {
  chooseWeightedPose,
  enqueuePose,
  getPlayback,
  getPoseDuration,
  getQueueDelay,
  takeEligiblePose,
} from './playback';

const POSES = {
  awakening: { image: '/images/mascot/dont-look/sprites/awakening.webp', cycle: 1200, label: 'TinkerHub mascot coming alive from its sticker', playback: { cycles: 1 }, next: 'ambientPeek' },
  returning: { image: '/images/mascot/dont-look/sprites/awakening.webp', cycle: 1200, label: 'TinkerHub mascot returning to life from its sticker', playback: { cycles: 1 }, transition: 'home' },
  ambientGlance: { image: '/images/mascot/dont-look/sprites/ambient-glance.webp', cycle: 8000, label: 'TinkerHub mascot resting in a beanbag', category: 'rest', kind: 'ambient', weight: 1, avoidAfter: ['recovery'] },
  ambientPeek: { image: '/images/mascot/dont-look/sprites/ambient-peek.webp', cycle: 8000, label: 'TinkerHub mascot peeking over a laptop', category: 'focus', kind: 'ambient', weight: 2 },
  ambientSun: {
    image: '/images/mascot/dont-look/sprites/sun.webp',
    cycle: 8000,
    label: 'TinkerHub mascot making a sunglasses flourish',
    playback: { cycles: 1, hold: { min: 1800, max: 3600 } },
    category: 'flourish',
    kind: 'flourish',
    weight: 0.6,
    transition: 'home',
  },
  rain: { image: '/images/mascot/dont-look/sprites/rain.webp', cycle: 4200, label: 'TinkerHub maker ready for rain', kind: 'weather', transition: 'home' },
  sun: { image: '/images/mascot/dont-look/sprites/sun.webp', cycle: 4200, label: 'TinkerHub maker with a cool flourish', energy: 'high' },
  hot: { image: '/images/mascot/dont-look/sprites/hot.webp', cycle: 6000, label: 'TinkerHub maker managing the heat', kind: 'weather', transition: 'home' },
  winter: { image: '/images/mascot/dont-look/sprites/winter.webp', cycle: 6000, label: 'TinkerHub maker keeping warm', kind: 'weather', transition: 'home' },
  debug: { image: '/images/mascot/dont-look/sprites/debug.webp', cycle: 4200, label: 'TinkerHub maker debugging a bug', domain: 'coder', next: 'breakthrough' },
  breakthrough: { image: '/images/mascot/dont-look/sprites/breakthrough.webp', cycle: 900, label: 'TinkerHub maker celebrating a code breakthrough', domain: 'coder', energy: 'high', next: 'reset' },
  solder: {
    image: '/images/mascot/dont-look/sprites/solder.webp',
    cycle: 4200,
    label: 'TinkerHub maker reacting to a soldering mishap',
    playback: { cycles: 1, hold: { min: 1800, max: 3600 } },
    domain: 'hardware',
    next: 'fix',
  },
  fix: { image: '/images/mascot/dont-look/sprites/fix.webp', cycle: 4200, label: 'TinkerHub maker repairing a prototype', domain: 'hardware', next: 'show' },
  show: { image: '/images/mascot/dont-look/sprites/show.webp', cycle: 4200, label: 'TinkerHub maker sharing a finished prototype', domain: 'hardware', next: 'reset' },
  dance: {
    image: '/images/mascot/dont-look/sprites/dance.webp',
    cycle: 900,
    label: 'TinkerHub maker dancing in celebration',
    playback: { cycles: 1, hold: { min: 1400, max: 2800 } },
    energy: 'high',
    next: 'reset',
  },
  reset: {
    image: '/images/mascot/dont-look/sprites/reset.webp',
    cycle: 4200,
    label: 'TinkerHub maker resetting for the next build',
    playback: { cycles: 1, hold: { min: 2200, max: 4200 } },
    category: 'recovery',
    transition: 'home',
  },
};

const AMBIENT_MIN_HOLD_MS = 20000;
const AMBIENT_MAX_HOLD_MS = 45000;
const HOME_MIN_HOLD_MS = 35000;
const HOME_MAX_HOLD_MS = 90000;
const HOME_MIN_TURNS = 2;
const HOME_MAX_TURNS = 3;
const PULSE_MIN_HOLD_MS = 2100;
const PULSE_MAX_HOLD_MS = 4200;
const SALIENT_COOLDOWN_MIN_MS = 45000;
const SALIENT_COOLDOWN_MAX_MS = 60000;
const WEATHER_REACTION_COOLDOWN_MS = 900000;
const FADE_MS = 380;
const AWAKENING_DURATION_MS = POSES.awakening.cycle * 4;
const RETURNING_DURATION_MS = POSES.returning.cycle * 4;
const STICKER_RETURN_COOLDOWN_MS = 60000;
const STORIES_PER_STICKER_RETURN = 2;
const RECENT_POSE_LIMIT = 3;
const HOME_POSES = Object.keys(POSES).filter((pose) => (
  POSES[pose].kind === 'ambient' || POSES[pose].kind === 'flourish'
));
const PLAYBACK_DURATIONS = {
  pulse: { min: PULSE_MIN_HOLD_MS, max: PULSE_MAX_HOLD_MS },
  ambient: { min: AMBIENT_MIN_HOLD_MS, max: AMBIENT_MAX_HOLD_MS },
};
const POSE_EVENT_PRIORITY = {
  rain: 2,
  hot: 2,
  winter: 2,
  dance: 1,
};
function getMakerDomain(pose) {
  return POSES[pose].domain || 'neutral';
}

function getWeatherPose(weather) {
  if (weather?.isRaining) return 'rain';
  if (weather?.temperature >= 32) return 'hot';
  if (weather?.temperature <= 24) return 'winter';
  return null;
}

function randomDuration(min, max) {
  return min + Math.round(Math.random() * (max - min));
}

export default function TinkerHubMascot({ makerCount, currentView, isVisible }) {
  const [weather, setWeather] = useState(null);
  const [activePose, setActivePose] = useState('awakening');
  const [previousPose, setPreviousPose] = useState(null);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const activePoseRef = useRef('awakening');
  const poseStartedAt = useRef(Date.now());
  const poseEndsAt = useRef(0);
  const previousMakerCount = useRef(null);
  const weatherPoseRef = useRef(null);
  const pendingPoses = useRef([]);
  const lastPose = useRef('awakening');
  const lastStickerReturnAt = useRef(Date.now());
  const lastCompletedWorkDomain = useRef(null);
  const completedWorkStories = useRef(0);
  const nextSalientAt = useRef(0);
  const lastWeatherReactionAt = useRef(0);
  const recentPoses = useRef([]);
  const homeTurns = useRef(0);
  const homeTurnTarget = useRef(0);
  const contextRef = useRef({ currentView, weather: null });
  const schedulerTimer = useRef(null);
  const fadeTimer = useRef(null);
  const wordmarkTimer = useRef(null);
  const awakeningTimer = useRef(null);
  const hasAwakenedRef = useRef(false);
  const advanceRef = useRef(null);

  const scheduleNext = useCallback((delay, trackPoseDeadline = true) => {
    window.clearTimeout(schedulerTimer.current);
    if (trackPoseDeadline) poseEndsAt.current = Date.now() + delay;
    schedulerTimer.current = window.setTimeout(() => advanceRef.current?.(), delay);
  }, []);

  const chooseNextPose = useCallback(() => {
    const now = Date.now();
    const queued = takeEligiblePose(
      pendingPoses.current,
      (pose) => POSES[pose].energy !== 'high' || now >= nextSalientAt.current,
    );
    if (queued.pose) {
      pendingPoses.current = queued.queue;
      return queued.pose;
    }

    const weatherPose = getWeatherPose(contextRef.current.weather);
    if (
      weatherPose
      && weatherPose !== lastPose.current
      && now - lastWeatherReactionAt.current >= WEATHER_REACTION_COOLDOWN_MS
    ) {
      return weatherPose;
    }

    const lastPoseDefinition = POSES[lastPose.current];
    if (lastPoseDefinition.next) return lastPoseDefinition.next;

    const canReturnToSticker = lastPose.current === 'reset'
      && completedWorkStories.current >= STORIES_PER_STICKER_RETURN
      && now - lastStickerReturnAt.current >= STICKER_RETURN_COOLDOWN_MS;
    if (canReturnToSticker) return 'returning';

    if (lastPoseDefinition.transition === 'home') {
      homeTurns.current = 1;
      homeTurnTarget.current = Math.random() < 0.5 ? HOME_MIN_TURNS : HOME_MAX_TURNS;
      return chooseWeightedPose(HOME_POSES, POSES, recentPoses.current, lastPose.current);
    }

    if (lastPoseDefinition.kind === 'ambient') {
      if (homeTurns.current < homeTurnTarget.current) {
        homeTurns.current += 1;
        return chooseWeightedPose(HOME_POSES, POSES, recentPoses.current, lastPose.current);
      }

      homeTurns.current = 0;
    }

    // A neutral reset bridges every work-domain swap, so hardware is never starved by page context.
    if (lastCompletedWorkDomain.current === 'coder') return 'solder';
    if (lastCompletedWorkDomain.current === 'hardware') return 'debug';
    return contextRef.current.currentView === 'calendar'
      ? 'debug'
      : chooseWeightedPose(['debug', 'solder'], POSES, recentPoses.current, lastPose.current);
  }, []);

  const transitionTo = useCallback((nextPose) => {
    const currentPose = activePoseRef.current;
    const currentDomain = getMakerDomain(currentPose);

    if (nextPose === 'returning') {
      window.clearTimeout(wordmarkTimer.current);
      setWordmarkVisible(false);
    }

    if (nextPose === 'reset' && currentDomain !== 'neutral') {
      lastCompletedWorkDomain.current = currentDomain;
      completedWorkStories.current += 1;
    }

    if (nextPose !== currentPose) {
      window.clearTimeout(fadeTimer.current);
      setPreviousPose(currentPose);
      setActivePose(nextPose);
      activePoseRef.current = nextPose;
      poseStartedAt.current = Date.now();
      fadeTimer.current = window.setTimeout(() => setPreviousPose(null), FADE_MS);

      if (currentPose === 'awakening' || currentPose === 'returning') {
        window.clearTimeout(wordmarkTimer.current);
        wordmarkTimer.current = window.setTimeout(() => setWordmarkVisible(true), FADE_MS);
      }
    }

    lastPose.current = nextPose;
    const isHighEnergy = POSES[nextPose].energy === 'high';
    if (isHighEnergy) {
      nextSalientAt.current = Date.now() + randomDuration(
        SALIENT_COOLDOWN_MIN_MS,
        SALIENT_COOLDOWN_MAX_MS,
      );
    }
    if (POSES[nextPose].kind === 'weather') lastWeatherReactionAt.current = Date.now();
    recentPoses.current = [...recentPoses.current, nextPose].slice(-RECENT_POSE_LIMIT);
    if (nextPose === 'returning') {
      lastStickerReturnAt.current = Date.now();
      completedWorkStories.current = 0;
      scheduleNext(RETURNING_DURATION_MS);
      return;
    }
    if (POSES[nextPose].kind === 'ambient') {
      scheduleNext(randomDuration(HOME_MIN_HOLD_MS, HOME_MAX_HOLD_MS));
      return;
    }

    scheduleNext(getPoseDuration(
      POSES[nextPose],
      isHighEnergy,
      PLAYBACK_DURATIONS,
      randomDuration,
    ));
  }, [scheduleNext]);

  useEffect(() => {
    advanceRef.current = () => transitionTo(chooseNextPose());
  }, [chooseNextPose, transitionTo]);

  const queuePoseAtLoopBoundary = useCallback((pose) => {
    pendingPoses.current = enqueuePose(
      pendingPoses.current,
      pose,
      POSE_EVENT_PRIORITY[pose] || 0,
    );

    // Let the intro and later return-to-sticker beat finish before outside events can interrupt them.
    if (!isVisible || !hasAwakenedRef.current || activePoseRef.current === 'returning') return;

    const delay = getQueueDelay({
      pose: POSES[activePoseRef.current],
      poseStartedAt: poseStartedAt.current,
      poseEndsAt: poseEndsAt.current,
      now: Date.now(),
    });
    scheduleNext(delay, false);
  }, [isVisible, scheduleNext]);

  useEffect(() => {
    if (!isVisible) return undefined;

    let cancelled = false;
    const refreshWeather = async () => {
      try {
        const nextWeather = await getCurrentWeather();
        if (!cancelled) setWeather(nextWeather);
      } catch {
        if (!cancelled) setWeather(null);
      }
    };

    refreshWeather();
    const interval = window.setInterval(refreshWeather, 300000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isVisible]);

  useEffect(() => {
    contextRef.current.currentView = currentView;
  }, [currentView]);

  useEffect(() => {
    if (!isVisible) return;

    contextRef.current.weather = weather;
    const nextWeatherPose = getWeatherPose(weather);
    if (
      nextWeatherPose
      && nextWeatherPose !== weatherPoseRef.current
      && Date.now() - lastWeatherReactionAt.current >= WEATHER_REACTION_COOLDOWN_MS
    ) {
      queuePoseAtLoopBoundary(nextWeatherPose);
    }
    weatherPoseRef.current = nextWeatherPose;
  }, [weather, isVisible, queuePoseAtLoopBoundary]);

  useEffect(() => {
    if (previousMakerCount.current !== null && makerCount > previousMakerCount.current) {
      queuePoseAtLoopBoundary('dance');
    }
    previousMakerCount.current = makerCount;
  }, [makerCount, queuePoseAtLoopBoundary]);

  useEffect(() => {
    if (!isVisible) return undefined;

    if (!hasAwakenedRef.current) {
      awakeningTimer.current = window.setTimeout(() => {
        hasAwakenedRef.current = true;
        transitionTo('ambientPeek');
      }, AWAKENING_DURATION_MS);

      return () => {
        window.clearTimeout(awakeningTimer.current);
        window.clearTimeout(schedulerTimer.current);
        window.clearTimeout(fadeTimer.current);
        window.clearTimeout(wordmarkTimer.current);
        setPreviousPose(null);
      };
    }

    const currentPose = activePoseRef.current;
    if (currentPose === 'returning') {
      scheduleNext(RETURNING_DURATION_MS);
    } else if (POSES[currentPose].kind === 'ambient') {
      scheduleNext(randomDuration(AMBIENT_MIN_HOLD_MS, AMBIENT_MAX_HOLD_MS));
    } else {
      const isHighEnergy = POSES[currentPose].energy === 'high';
      scheduleNext(getPoseDuration(
        POSES[currentPose],
        isHighEnergy,
        PLAYBACK_DURATIONS,
        randomDuration,
      ));
    }
    return () => {
      window.clearTimeout(schedulerTimer.current);
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(wordmarkTimer.current);
      setPreviousPose(null);
    };
  }, [isVisible, scheduleNext, transitionTo]);

  if (!isVisible) return null;

  const renderSprite = (pose, className) => {
    const playback = getPlayback(POSES[pose]);

    return (
      <div
        key={`${className}-${pose}`}
        className={`tinkerhub-mascot__sprite ${className}`}
        role={className === 'tinkerhub-mascot__sprite--active' ? 'img' : undefined}
        aria-label={className === 'tinkerhub-mascot__sprite--active' ? POSES[pose].label : undefined}
        style={{
          '--mascot-sprite': `url(${process.env.PUBLIC_URL}${POSES[pose].image})`,
          '--mascot-cycle': `${POSES[pose].cycle}ms`,
          '--mascot-sprite-iterations': Number.isFinite(playback.cycles) ? playback.cycles : 'infinite',
        }}
      />
    );
  };

  return (
    <div className="tinkerhub-mascot">
      {previousPose && renderSprite(previousPose, 'tinkerhub-mascot__sprite--leaving')}
      {renderSprite(activePose, 'tinkerhub-mascot__sprite--active')}
      {wordmarkVisible && (
        <span
          className="tinkerhub-mascot__wordmark"
          aria-hidden="true"
        >
          TinkerHub
        </span>
      )}
    </div>
  );
}
