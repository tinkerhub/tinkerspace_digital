import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWeather } from '../../utils/api/weatherService';
import {
  enqueuePose,
  getPlayback,
  getPoseDuration,
  getQueueDelay,
} from './playback';
import { PLAYBACK_DURATIONS, POLICY_LIMITS, POSE_EVENT_PRIORITY, POSES } from './manifest';
import { decideNextPose, getMakerDomain, getWeatherPose } from './policy';

const FADE_MS = 380;
const AWAKENING_DURATION_MS = POSES.awakening.cycle * 4;
const RETURNING_DURATION_MS = POSES.returning.cycle * 4;

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
  const hasAwakenedRef = useRef(false);
  const advanceRef = useRef(null);

  const scheduleNext = useCallback((delay, trackPoseDeadline = true) => {
    window.clearTimeout(schedulerTimer.current);
    if (trackPoseDeadline) poseEndsAt.current = Date.now() + delay;
    schedulerTimer.current = window.setTimeout(() => advanceRef.current?.(), delay);
  }, []);

  const selectNextPose = useCallback(() => {
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
      homeTurns: homeTurns.current,
      homeTurnTarget: homeTurnTarget.current,
    });

    pendingPoses.current = decision.queue;
    if (decision.home) {
      homeTurns.current = decision.home.turns;
      homeTurnTarget.current = decision.home.target;
    }
    return decision.pose;
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

    const isHighEnergy = POSES[nextPose].energy === 'high';
    if (isHighEnergy) {
      nextSalientAt.current = Date.now() + randomDuration(
        POLICY_LIMITS.salientCooldown.min,
        POLICY_LIMITS.salientCooldown.max,
      );
    }
    if (POSES[nextPose].kind === 'weather') lastWeatherReactionAt.current = Date.now();
    recentPoses.current = [...recentPoses.current, nextPose].slice(-POLICY_LIMITS.recentPoseLimit);
    sessionHistory.current = [...sessionHistory.current, nextPose]
      .slice(-POLICY_LIMITS.sessionExposureLimit);
    if (nextPose === 'returning') {
      lastStickerReturnAt.current = Date.now();
      completedWorkStories.current = 0;
      scheduleNext(RETURNING_DURATION_MS);
      return;
    }
    if (POSES[nextPose].kind === 'ambient') {
      scheduleNext(randomDuration(POLICY_LIMITS.homeHold.min, POLICY_LIMITS.homeHold.max));
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
    advanceRef.current = () => transitionTo(selectNextPose());
  }, [selectNextPose, transitionTo]);

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
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    if (!isVisible) return;

    const nextWeatherPose = getWeatherPose(weather);
    if (
      nextWeatherPose
      && nextWeatherPose !== weatherPoseRef.current
      && Date.now() - lastWeatherReactionAt.current >= POLICY_LIMITS.weatherCooldown
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
      scheduleNext(randomDuration(PLAYBACK_DURATIONS.ambient.min, PLAYBACK_DURATIONS.ambient.max));
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
