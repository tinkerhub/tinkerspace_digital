import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWeather } from '../../utils/api/weatherService';
import {
  enqueueEvent,
  getPlayback,
  getQueueDelay,
  getScheduledPoseDuration,
} from './playback';
import {
  EVENT_DEFINITIONS,
  PLAYBACK_DURATIONS,
  POLICY_LIMITS,
  POSES,
} from './manifest';
import { decideNextPose, getWeatherPose } from './policy';
import {
  getMascotAssetUrl,
  getMascotWatchdogFailure,
} from './watchdog';

const FADE_MS = 380;
const WATCHDOG_INTERVAL_MS = 5000;
const WATCHDOG_SCHEDULER_GRACE_MS = 12000;
const WATCHDOG_ANIMATION_GRACE_MS = 15000;
const MASCOT_ASSET_VERSION = process.env.REACT_APP_MASCOT_ASSET_VERSION || 'mascot-watchdog-v1';
const PUBLIC_ASSET_BASE = process.env.PUBLIC_URL === '.' ? '' : process.env.PUBLIC_URL;
const FALLBACK_STICKER_IMAGE = '/images/dont-look.webp';

function randomDuration(min, max) {
  return min + Math.round(Math.random() * (max - min));
}

export default function TinkerHubMascot({ makerCount, currentView, isVisible }) {
  const [weather, setWeather] = useState(null);
  const [activePose, setActivePose] = useState('awakening');
  const [previousPose, setPreviousPose] = useState(null);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [failSafeReason, setFailSafeReason] = useState(null);
  const activePoseRef = useRef('awakening');
  const poseStartedAt = useRef(Date.now());
  const poseEndsAt = useRef(0);
  const lastAnimationHeartbeatAt = useRef(Date.now());
  const previousMakerCount = useRef(null);
  const weatherPoseRef = useRef(null);
  const pendingPoses = useRef([]);
  const lastStickerReturnAt = useRef(Date.now());
  const lastCompletedWorkDomain = useRef(null);
  const completedWorkStories = useRef(0);
  const nextSalientAt = useRef(0);
  const lastWeatherReactionAt = useRef(0);
  const recentPoses = useRef([]);
  const sessionHistory = useRef([]);
  const homeTurns = useRef(0);
  const homeTurnTarget = useRef(0);
  const currentViewRef = useRef(currentView);
  const schedulerTimer = useRef(null);
  const fadeTimer = useRef(null);
  const wordmarkTimer = useRef(null);
  const awakeningTimer = useRef(null);
  const watchdogTimer = useRef(null);
  const failSafeActiveRef = useRef(false);
  const hasAwakenedRef = useRef(false);
  const advanceRef = useRef(null);

  const activateFailSafe = useCallback((reason) => {
    if (failSafeActiveRef.current) return;
    failSafeActiveRef.current = true;
    window.clearTimeout(schedulerTimer.current);
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(wordmarkTimer.current);
    window.clearTimeout(awakeningTimer.current);
    window.clearInterval(watchdogTimer.current);
    setPreviousPose(null);
    setWordmarkVisible(false);
    setFailSafeReason(reason);
  }, []);

  const scheduleNext = useCallback((delay, trackPoseDeadline = true) => {
    if (failSafeActiveRef.current) return;
    window.clearTimeout(schedulerTimer.current);
    if (trackPoseDeadline) poseEndsAt.current = Date.now() + delay;
    schedulerTimer.current = window.setTimeout(() => { if (advanceRef.current) advanceRef.current(); }, delay);
  }, []);

  const selectNextPose = useCallback((preferHomeEntry = false) => {
    const decision = decideNextPose({
      now: Date.now(),
      pendingEvents: pendingPoses.current,
      lastPose: activePoseRef.current,
      recentPoses: recentPoses.current,
      sessionHistory: sessionHistory.current,
      currentView: currentViewRef.current,
      lastCompletedWorkDomain: lastCompletedWorkDomain.current,
      completedWorkStories: completedWorkStories.current,
      lastStickerReturnAt: lastStickerReturnAt.current,
      nextSalientAt: nextSalientAt.current,
      lastWeatherReactionAt: lastWeatherReactionAt.current,
      homeTurns: homeTurns.current,
      homeTurnTarget: homeTurnTarget.current,
      preferHomeEntry,
    });

    pendingPoses.current = decision.queue;
    if (decision.home) {
      homeTurns.current = decision.home.turns;
      homeTurnTarget.current = decision.home.target;
    }
    return decision;
  }, []);

  const transitionTo = useCallback((decision) => {
    const { pose: nextPose, effects } = decision;
    const currentPose = activePoseRef.current;

    if (nextPose === 'returning') {
      window.clearTimeout(wordmarkTimer.current);
      setWordmarkVisible(false);
    }

    if (effects && effects.storyCompleted) {
      lastCompletedWorkDomain.current = effects.storyCompleted;
      completedWorkStories.current += 1;
    }
    if (effects && effects.eventPlayed && effects.eventPlayed.type === 'weather') lastWeatherReactionAt.current = Date.now();
    if (effects && effects.stickerReturned) {
      lastStickerReturnAt.current = Date.now();
      completedWorkStories.current = 0;
    }

    if (nextPose !== currentPose) {
      window.clearTimeout(fadeTimer.current);
      setPreviousPose(currentPose);
      setActivePose(nextPose);
      activePoseRef.current = nextPose;
      poseStartedAt.current = Date.now();
      lastAnimationHeartbeatAt.current = Date.now();
      fadeTimer.current = window.setTimeout(() => setPreviousPose(null), FADE_MS);

      if (currentPose === 'awakening' || currentPose === 'returning') {
        window.clearTimeout(wordmarkTimer.current);
        wordmarkTimer.current = window.setTimeout(() => setWordmarkVisible(true), FADE_MS);
      }
    }

    const startsSalientCooldown = POSES[nextPose].salientRole === 'community-event'
      || (effects && Boolean(effects.storyCompleted));
    if (startsSalientCooldown) {
      nextSalientAt.current = Date.now() + randomDuration(
        POLICY_LIMITS.salientCooldown.min,
        POLICY_LIMITS.salientCooldown.max,
      );
    }
    recentPoses.current = [...recentPoses.current, nextPose].slice(-POLICY_LIMITS.recentPoseLimit);
    sessionHistory.current = [...sessionHistory.current, nextPose]
      .slice(-POLICY_LIMITS.sessionExposureLimit);
    scheduleNext(getScheduledPoseDuration(
      POSES[nextPose],
      PLAYBACK_DURATIONS,
      randomDuration,
    ));
  }, [scheduleNext]);

  useEffect(() => {
    advanceRef.current = () => transitionTo(selectNextPose());
  }, [selectNextPose, transitionTo]);

  const queueEventAtLoopBoundary = useCallback((event) => {
    if (failSafeActiveRef.current) return;
    pendingPoses.current = enqueueEvent(
      pendingPoses.current,
      event,
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
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    if (!isVisible) return;

    const nextWeatherPose = getWeatherPose(weather);
    if (
      nextWeatherPose
      && nextWeatherPose !== weatherPoseRef.current
    ) {
      const now = Date.now();
      queueEventAtLoopBoundary({
        ...EVENT_DEFINITIONS.weather,
        reactionPose: nextWeatherPose,
        createdAt: now,
        expiresAt: now + EVENT_DEFINITIONS.weather.expiresAfter,
      });
      weatherPoseRef.current = nextWeatherPose;
    }
    if (!nextWeatherPose) {
      weatherPoseRef.current = null;
      pendingPoses.current = pendingPoses.current.filter(
        (event) => event.dedupeKey !== EVENT_DEFINITIONS.weather.dedupeKey,
      );
    }
  }, [weather, isVisible, queueEventAtLoopBoundary]);

  useEffect(() => {
    if (previousMakerCount.current !== null && makerCount > previousMakerCount.current) {
      const now = Date.now();
      queueEventAtLoopBoundary({
        ...EVENT_DEFINITIONS.makerJoin,
        createdAt: now,
        expiresAt: now + EVENT_DEFINITIONS.makerJoin.expiresAfter,
        payload: { count: makerCount - previousMakerCount.current },
      });
    }
    previousMakerCount.current = makerCount;
  }, [makerCount, queueEventAtLoopBoundary]);

  useEffect(() => {
    if (!isVisible) return undefined;

    if (!hasAwakenedRef.current) {
      awakeningTimer.current = window.setTimeout(() => {
        hasAwakenedRef.current = true;
        transitionTo(selectNextPose(true));
      }, getScheduledPoseDuration(POSES.awakening, PLAYBACK_DURATIONS, randomDuration));

      return () => {
        window.clearTimeout(awakeningTimer.current);
        window.clearTimeout(schedulerTimer.current);
        window.clearTimeout(fadeTimer.current);
        window.clearTimeout(wordmarkTimer.current);
        setPreviousPose(null);
      };
    }

    const currentPose = activePoseRef.current;
    if (currentPose !== 'returning') setWordmarkVisible(true);

    scheduleNext(getScheduledPoseDuration(
      POSES[currentPose],
      PLAYBACK_DURATIONS,
      randomDuration,
    ));
    return () => {
      window.clearTimeout(schedulerTimer.current);
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(wordmarkTimer.current);
      window.clearInterval(watchdogTimer.current);
      setPreviousPose(null);
    };
  }, [isVisible, scheduleNext, selectNextPose, transitionTo]);

  useEffect(() => {
    if (!isVisible || failSafeReason) return undefined;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      cancelled = true;
    };
    image.onerror = () => {
      if (!cancelled) activateFailSafe('asset-error');
    };
    image.src = getMascotAssetUrl(PUBLIC_ASSET_BASE, POSES[activePose].image, MASCOT_ASSET_VERSION);

    return () => {
      cancelled = true;
    };
  }, [activePose, activateFailSafe, failSafeReason, isVisible]);

  useEffect(() => {
    if (!isVisible || failSafeReason) return undefined;

    watchdogTimer.current = window.setInterval(() => {
      if (document.hidden) {
        lastAnimationHeartbeatAt.current = Date.now();
        return;
      }

      const reason = getMascotWatchdogFailure({
        now: Date.now(),
        pose: POSES[activePoseRef.current],
        poseEndsAt: poseEndsAt.current,
        lastAnimationHeartbeatAt: lastAnimationHeartbeatAt.current,
        hasAwakened: hasAwakenedRef.current,
        schedulerGraceMs: WATCHDOG_SCHEDULER_GRACE_MS,
        animationGraceMs: WATCHDOG_ANIMATION_GRACE_MS,
      });

      if (reason) activateFailSafe(reason);
    }, WATCHDOG_INTERVAL_MS);

    return () => {
      window.clearInterval(watchdogTimer.current);
    };
  }, [activateFailSafe, failSafeReason, isVisible]);

  if (!isVisible) return null;

  if (failSafeReason) {
    return (
      <div
        className="tinkerhub-mascot tinkerhub-mascot--fallback"
        data-failsafe-reason={failSafeReason}
      >
        <img
          className="tinkerhub-mascot__fallback-sticker"
          src={getMascotAssetUrl(PUBLIC_ASSET_BASE, FALLBACK_STICKER_IMAGE, MASCOT_ASSET_VERSION)}
          alt="TinkerHub mascot sticker"
        />
      </div>
    );
  }

  const renderSprite = (pose, className) => {
    const playback = getPlayback(POSES[pose]);
    const markAnimationHeartbeat = (event) => {
      if (event.animationName === 'mascot-sprite') {
        lastAnimationHeartbeatAt.current = Date.now();
      }
    };

    return (
      <div
        key={`${className}-${pose}`}
        className={`tinkerhub-mascot__sprite ${className}`}
        role={className === 'tinkerhub-mascot__sprite--active' ? 'img' : undefined}
        aria-label={className === 'tinkerhub-mascot__sprite--active' ? POSES[pose].label : undefined}
        onAnimationStart={markAnimationHeartbeat}
        onAnimationIteration={markAnimationHeartbeat}
        style={{
          '--mascot-sprite': `url(${getMascotAssetUrl(PUBLIC_ASSET_BASE, POSES[pose].image, MASCOT_ASSET_VERSION)})`,
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
