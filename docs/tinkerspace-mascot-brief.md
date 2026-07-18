# TinkerSpace Mascot Brief

## Purpose

Animate the existing TinkerSpace `dont-look.png` maker avatar as a companion for the Digital kiosk. The mascot should celebrate making, coding, repair, experimentation, and community without competing with the maker feed or calendar.

## Identity And Visual System

The mascot is the existing hand-drawn maker avatar. Its personality is curious, welcoming, practical, and quietly proud of makers. Clear activity silhouettes make each state legible at kiosk size.

- Hair and outlines use near-black.
- Skin and celebration details use coral `#FF5236`.
- Clothing, blanket, and maker details use electric violet `#5E36F6`.
- Large, simple shapes must stay legible on kiosks and Android TV displays.
- Torso-visible poses retain the original simplified, non-body-emphasizing sticker silhouette.
- Every active sprite is an appropriately sized WebP file with a transparent sticker outline and a four-frame 2x2 grid.
- `dont-look.png` remains the source reference asset. Laptop scenes retain the `DON'T LOOK` sticker; the separate TinkerHub wordmark only appears in the awakening and return sequence, then stays parked nearby.

## Animation Story

The mascot is not a page-change indicator. It is an ambient companion that occasionally does meaningful maker work.

- On first appearance, the laptop sticker wakes: the mascot rolls its eyes and throws the TinkerHub label to its settled nearby position before entering the laptop-peek home state.
- After two completed maker stories and at least one minute, it repeats the same return-to-sticker and label-throw beat. The shared sprite sheet owns the throw; the separate nearby wordmark appears only after that sheet has faded, then stays still. It never loops or circles around the mascot.
- After a reset or sticker return, the mascot holds two or three irregular 35-90 second ambient turns before an autonomous maker story. Current home states are beanbag rest and laptop-peek; the sunglasses flourish is an occasional one-shot home beat rather than a loop.
- Ambient poses use small eye, blink, shoulder, and hand changes. The body should remain visually anchored so the character does not read as a sliding sticker.
- Coding follows `debug` -> `breakthrough` -> `reset`.
- Hardware follows `solder` -> `fix` -> `show` -> `reset`.
- Coding and hardware never cut directly into one another. Reset, weather, or community animation bridges the domains, and completed work stories alternate between coder and hardware domains.
- Soldering starts with the iron touching the PCB and a contained spark. It then moves to repair, sharing the prototype, and reset. The visual must preserve plausible object placement: tools and objects must not intersect the mascot after release.
- A new maker queues `dance`, followed by reset before the next autonomous choice.
- Weather reactions are rain/umbrella, heat/sweating, and winter/blanket. Rain takes precedence; `32 C+` selects heat and `24 C and below` selects winter.

## Playback And Event Rules

The playback executor is event-aware without being event-driven in a robotic sense.

- Page changes only influence the next autonomous work choice. They do not replace the active sprite.
- Maker joins and weather changes enter a deduplicated priority queue and begin at a frame-cycle boundary.
- One-shot action sheets, including soldering, dance, and reset, play once and hold their final frame for a short randomized recovery pause before advancing. Queued events do not interrupt that recovery.
- The sunglasses flourish uses the same one-shot policy, with a randomized 1.8-3.6 second recovery hold before returning to a normal home pose.
- High-salience movement has a randomized 45-60 second attention cooldown. Weather reactions have a 15-minute cooldown.
- Ambient selection is weighted rather than fixed. It favors the laptop-peek state, penalizes the three most recent poses, penalizes consecutive category repeats, and makes rest after recovery unlikely rather than impossible.
- Weather and maker events wait for the current configured story or standalone path to finish, then enter through its recovery or home bridge.
- Sprite changes crossfade for 380 ms at safe boundaries.

This creates controlled variation: enough novelty to appear alive over a kiosk session, without the visual noise of random, unrelated pose changes.

## Behaviour Policy

### Evidence Base

- Repetition is not always harmful. Won and Geng found that passive exposure to recurring distractors can reduce their later interference. The mascot should therefore keep home behavior familiar and low-salience, rather than seeking maximum novelty. Variety should prevent an obvious fixed playlist, not make every transition surprising. [Won and Geng, 2020](https://pubmed.ncbi.nlm.nih.gov/32250138/)
- Motion onset captures attention, so salient motion should be deliberate. A queued maker celebration or weather reaction must wait for a safe boundary instead of interrupting focused work. [Smith and Abrams, 2018](https://profiles.wustl.edu/en/publications/motion-onset-really-does-capture-attention)
- Interruptions that are longer or more demanding increase the cost of resuming a suspended goal. One-shot recovery holds and non-interruptible work beats are therefore part of the experience design, not merely animation timing. [Monk et al., 2008](https://pubmed.ncbi.nlm.nih.gov/19102614/)
- Perceived animacy benefits from fast detection of goal-directed movement combined with higher-level inference about intention. The mascot therefore uses causal stories, such as debugging to breakthrough or soldering to repair, rather than shuffled poses. This is an informed design inference, not evidence that this specific kiosk has measured visitor animacy judgments. [Gao et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31446655/)

These findings guide timing and variety. They do not claim that individual kiosk visitors have been measured or that the exact timings are universally optimal.

### Runtime Architecture

The mascot uses a small hybrid behaviour policy:

- A **behaviour tree** defines priority and causal meaning.
- A **context blackboard** holds current signals, cooldowns, and history.
- **Weighted selector nodes** choose among already-valid home or new-story candidates.
- The existing playback executor continues to own CSS frame timing, one-shot holds, crossfades, visibility pause/resume, reduced-motion behavior, and WebP rendering.

The behaviour tree, context blackboard, and weighted selectors are first-class runtime concepts implemented through manifest data, context assembly, and pure policy functions. They are not a runtime animation library, so the Netlify bundle remains small and the policy can be tested deterministically with a fixed random function.

```text
Priority selector
  1. Finish non-interruptible active one-shot or recovery hold
  2. Continue the active causal maker story
  3. Play the highest-priority eligible queued event
  4. Return to sticker when its story-count and cooldown guards pass
  5. Select a valid home beat
  6. Select a valid new maker story
```

### Context Blackboard

The policy receives a compact immutable context for each decision:

- `lastPose` and the current home-beat count.
- `pendingEvents`, deduplicated by type and ordered by priority; app effects apply weather cooldowns before queueing.
- Current display view as a soft bias; the calendar view increases the weight of the coding story and other views are neutral.
- Recent poses, completed story domain, and completed story count.
- A bounded session-exposure history that records the last twelve selected beats, so a pose or category that has dominated the session is gradually deprioritized without being permanently excluded.
- Salient-motion and sticker-return cooldown deadlines.

No policy branch reads browser state directly. App effects convert live maker, weather, and view changes into normalized context; the playback executor separately owns animation deadlines and visibility cleanup.

### Asset Manifest And Policy Boundary

The runtime separates visual assets from policy meaning:

- The **asset manifest** is the single registry for sprite path, playback contract, visual category, energy level, standalone transitions, and complete maker-story definitions.
- The **policy tree** evaluates priority, eligibility, and transitions using manifest IDs. It never references sprite file paths.
- The **playback executor** resolves a selected manifest ID into the existing CSS/WebP sprite behavior.

A manifest entry declares visual playback and story membership, but not global priority. For example, a prototype-testing pose can join the `hardware` story and inherit its causal sequencing. The policy decides whether a story, home beat, or queued event is eligible. This prevents individual assets from accumulating conflicting global rules.

```js
prototypeTest: {
  image: '/images/mascot/dont-look/sprites/prototype-test.webp',
  cycle: 4200,
  playback: { cycles: 1, hold: { min: 1600, max: 2800 } },
  story: 'hardware',
}
```

To add a new animation, a developer should:

1. Add the optimized WebP sprite under `public/images/mascot/dont-look/sprites/`.
2. Register one manifest entry with the asset's visual and playback facts.
3. Add the manifest ID to a `STORIES` path or the `homeBeat` selector. Weather reactions also require an explicit entry in the weather-pose mapping and event priority map.
4. Add tests that prove the new candidate cannot bypass cooldown, story, or interruption rules.

The developer should not add timing logic, direct page checks, or global priority conditions to the asset definition.

### Performance Budget

- Use plain objects and pure selector functions. Do not introduce a behaviour-tree package, runtime animation library, state-machine package, canvas, or per-frame JavaScript work.
- Make a decision only when a pose ends, a queued event becomes eligible, or visibility changes. CSS continues to advance the sprite frames.
- The manifest is small JavaScript metadata and should add only a negligible bundle cost. It does not preload every WebP asset.
- A new animation increases transfer size only when its image is requested. New assets must remain optimized WebP sprite sheets and preserve the current small-kiosk visual budget.
- Keep policy selection bounded to the small current candidate set. Candidate filtering and weighted selection are linear in that set and do not create a persistent browser workload.

### Event Mapping

| Signal | Policy effect | Safe release point |
| --- | --- | --- |
| Maker count increases | Queue one `dance` community event. | After the active maker story or recovery beat. |
| Weather becomes rainy, hot, or cold | Queue the matching weather reaction if its cooldown has expired. | After the active maker story or recovery beat. |
| Calendar or maker-feed context changes | Bias the next autonomous maker story. | Never interrupts the current pose. |
| Two completed maker stories | Make a sticker-return sequence eligible. | After reset and its cooldown. |
| No eligible event | Select a low-amplitude home beat or a new story. | At the next policy decision. |

### Story And Selection Rules

- Coding remains `debug` -> `breakthrough` -> `reset`.
- Hardware remains `solder` -> `fix` -> `show` -> `reset`.
- A coding story and a hardware story never cut directly into one another; reset, weather, or a community beat bridges them.
- High-salience poses obey the attention cooldown even when queued. Events remain pending instead of being discarded.
- One-shot poses complete their frame cycle and recovery hold before a queued event is considered.
- Home selection is weighted only after eligibility filtering. It excludes impossible candidates, strongly penalizes recent poses and category repeats, and makes recovery-to-rest uncommon rather than prohibited.
- Session exposure applies a softer, longer-horizon penalty than recent-pose exclusion. It makes the policy explore compatible alternatives over time while retaining familiar low-salience home behavior.
- The sunglasses flourish is a rare one-shot home beat, not a looping idle.

### Bounded Randomness

Randomness belongs inside valid choices, never above the story rules. A weighted selector may choose among compatible home states or eligible next stories, but cannot choose a direct hardware-to-coder jump, replay a cooldown-limited celebration, or interrupt soldering mid-recovery. Short-term recency and longer session exposure make the resulting combinations varied without treating novelty itself as the goal.

This produces combinations such as:

```text
home -> debug -> breakthrough -> reset -> rain -> home
home -> solder -> fix -> show -> reset -> dance -> home
home -> sunglasses flourish -> home -> hardware story
```

The selector should accept an injected random function. Production uses `Math.random`; tests use a seeded or fixed function to prove constraints and replay a decision trace exactly.

### Verification Requirements

- Use fixed random functions in unit tests to replay a decision trace and prove story, cooldown, queue, and selector invariants.
- Verify that every manifest-referenced sprite is optimized WebP and that no unused sprite remains in the mascot directory.
- Keep the CSS/WebP executor and accessibility behavior intact while policy evolves.
- Keep policy decisions explainable as a short trace and every generated combination within the story invariants.

## Performance And Accessibility Rules

- Do not introduce a runtime animation library.
- Load the mascot after the main display is ready.
- Use prebuilt sprite frames and CSS `steps()` instead of dynamic particles or canvas effects.
- Isolate mascot failures so maker and calendar views continue working.
- Pause work while the kiosk tab is hidden and honor `prefers-reduced-motion` by rendering the first sprite frame only.
- Keep active mascot assets in WebP and avoid changes to unrelated application assets.
