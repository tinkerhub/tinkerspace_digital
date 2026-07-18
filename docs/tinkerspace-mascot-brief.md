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
- Home time comes first. The mascot holds two or three irregular 35-90 second ambient turns before an autonomous maker story. Current home states are beanbag rest and laptop-peek; the sunglasses flourish is an occasional one-shot home beat rather than a loop.
- Ambient poses use small eye, blink, shoulder, and hand changes. The body should remain visually anchored so the character does not read as a sliding sticker.
- Coding follows `debug` -> `breakthrough` -> `reset`.
- Hardware follows `solder` -> `fix` -> `show` -> `reset`.
- Coding and hardware never cut directly into one another. Reset, weather, or community animation bridges the domains, and completed work stories alternate between coder and hardware domains.
- Soldering starts with the iron touching the PCB and a contained spark. It then moves to repair, sharing the prototype, and reset. The visual must preserve plausible object placement: tools and objects must not intersect the mascot after release.
- A new maker queues `dance`, followed by reset before the next autonomous choice.
- Weather reactions are rain/umbrella, heat/sweating, and winter/blanket. Rain takes precedence; `32 C+` selects heat and `24 C and below` selects winter.

## Scheduler Policy

The scheduler is deliberately event-aware but not event-driven in the robotic sense.

- Page changes only influence the next autonomous work choice. They do not replace the active sprite.
- Maker joins and weather changes enter a deduplicated priority queue and begin at a frame-cycle boundary.
- One-shot action sheets, including soldering, dance, and reset, play once and hold their final frame for a short randomized recovery pause before advancing. Queued events do not interrupt that recovery.
- The sunglasses flourish uses the same one-shot policy, with a randomized 1.8-3.6 second recovery hold before returning to a normal home pose.
- High-salience movement has a randomized 45-60 second attention cooldown. Weather reactions have a 15-minute cooldown.
- Ambient selection is weighted rather than fixed. It favors the laptop-peek state, penalizes the three most recent poses, penalizes consecutive category repeats, and makes rest after recovery unlikely rather than impossible.
- Weather and maker events can break an otherwise expected sequence, but strict coder and hardware links preserve causal maker stories.
- Sprite changes crossfade for 380 ms at safe boundaries.

This creates controlled variation: enough novelty to appear alive over a kiosk session, without the visual noise of random, unrelated pose changes.

## Evidence Base

- Repeated task-irrelevant distractors lose attentional effect through habituation. Long, varied home holds and recent-pose penalties therefore reduce a fixed-playlist feeling. [Won and Geng, 2020](https://pubmed.ncbi.nlm.nih.gov/32250138/)
- Motion onset captures attention, while long or demanding interruptions increase resumption cost. Strong movement is reserved for maker joins, weather changes, and story payoffs, and starts at a sprite boundary. [Smith and Abrams, 2018](https://pubmed.ncbi.nlm.nih.gov/29971749/) [Monk et al., 2008](https://pubmed.ncbi.nlm.nih.gov/19102614/)
- Perceived animacy benefits from motion that appears goal-directed. Coding and hardware frames remain causal stories with neutral bridges instead of unrelated shuffled poses. [Perez et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31446655/)

These findings guide timing and variety. They do not claim that individual kiosk visitors have been measured or that the exact timings are universally optimal.

## Performance And Accessibility Rules

- Do not introduce a runtime animation library.
- Load the mascot after the main display is ready.
- Use prebuilt sprite frames and CSS `steps()` instead of dynamic particles or canvas effects.
- Isolate mascot failures so maker and calendar views continue working.
- Pause work while the kiosk tab is hidden and honor `prefers-reduced-motion` by rendering the first sprite frame only.
- Keep active mascot assets in WebP and avoid changes to unrelated application assets.
