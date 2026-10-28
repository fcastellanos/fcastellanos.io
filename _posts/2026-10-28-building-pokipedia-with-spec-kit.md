---
title: "Three Features in Four Days: Building a Fan Site with Spec Kit"
date: 2026-10-28T16:30:00-07:00
tags: [ai, claude, spec-kit, rust]
---

My earlier posts in this series were about a long-running project, with a board, tickets and a workflow that grew over months. This one is about a project that started from nothing on a Saturday afternoon. It's an unofficial fan site for Pokémon Pokopia, which I called Pokipedia. Over four days it got three features: a Pokémon directory with a map and accounts, a "Habitat Dex," and original artwork for all 254 habitats. Each one went through GitHub's Spec Kit before any code was written. This post covers what that looked like, and what the specs caught.

## The project

Pokipedia is a searchable directory of every Pokémon in Pokopia. It has profile pages with their in-game details and where to find them, an interactive map, and accounts for tracking the Pokémon you've discovered. It's built with [Loco](https://loco.rs), a Rails-like framework for Rust, with server-rendered templates and PostgreSQL. Every page works without JavaScript, and it ships as a single Docker container.

![The Pokipedia directory page in the light "Cozy Rural" theme](/assets/img/posts/pokipedia/directory.png)
*The directory in the light "Cozy Rural" theme. The eggs are placeholders until the artwork is downloaded.*

## Spec Kit in one paragraph

Spec Kit turns "build me X" into a sequence of documents, each one a slash command. A **constitution** holds the project's rules. Then, for each feature: `/speckit-specify` writes the spec (user stories, requirements, success criteria), `/speckit-clarify` asks questions about anything ambiguous, `/speckit-plan` writes the technical plan, research and data model, `/speckit-tasks` breaks it into numbered tasks, and `/speckit-analyze` checks all of them against each other and against the constitution. Only then does implementation start.

That's a lot of documents for a fan site. It turned out to be worth it.

## A constitution with one non-negotiable rule

The constitution has six principles. Most are what you'd expect: a Loco monolith, PostgreSQL, secure cookie-based sessions. One is marked **NON-NEGOTIABLE**: the site has to look like Pokopia's cozy "Chill & Pop" style. And it isn't vague about it:

- Interactive controls at least 44×44px, and borders and icon strokes at least 2px.
- Rounded corners on every component, taken from a fixed radius scale.
- Bouncy hover and press animations that only animate `transform` and `opacity`, never layout, and that turn into a short fade under reduced motion.
- WCAG AA contrast in both light and dark themes.

Rules like these are only useful if something checks them. A test (`tests/style_tokens.rs`) fails if a color or length is written anywhere except the design tokens file. The 44px rule kept catching real bugs, as you'll see below.

The constitution also settled arguments before they started. The feature description asked for "pixel borders" and "pixelated" progress bars. During clarification, the agent pointed out that this contradicted the constitution's rounded style. The answer we recorded in the spec: follow the constitution, and get the retro inventory feel from the layout instead (slot-style tile grids, category badges, segmented progress bars).

## Feature 001: one evening

The first commit, at 3:35 on a Saturday afternoon, was nothing but documents: the constitution, the spec, plan, research, data model, contracts, quickstart and task list, plus a researched dataset of the game's Pokémon. The spec had six user stories, from "browse the directory" (P1) down to "track discoveries" (P3). The task list had 87 tasks.

Then the commits follow the task list almost line by line:

```
feat: verified schema, generated entities, migration test (T007, T015-T021)
feat: idempotent catalog loader and seed_pokopia task (T008, T024, T025)
feat: Pokémon directory with tiles, Pokédex switching, sort, and pages (US1)
feat: Pokémon profile pages with stats and "Where to find" (US2)
fix: MVP checkpoint findings (control sizes, narrow header, specialty text)
feat: directory search and combined filters (US3)
feat: interactive Pokopia map with area panels (US4)
feat: accounts with email confirmation, sessions, and a private profile (US5)
feat: discovery tracking with live progress bars (US6)
```

The pull request was merged at 9:13 that night. That's not because the agent is fast at typing. It's because every decision had been made in the documents first, so implementation was mostly executing a plan that had already been checked.

The task list also had a checkpoint after the first two stories, the MVP, and it found real problems. Expandable badges were 32px tall, under the 44px minimum. At 320px wide, the header's search box pushed its button off the screen. A few of the dataset's descriptions had typos. All of that was fixed before moving on.

## When the spec itself is wrong

The second feature, the Habitat Dex, lists every habitat you can build in the game, with the items it needs and the Pokémon it attracts. The spec said that a requirement with no quantity was a "placement condition," like "High-up location."

That was wrong. In the dataset, a missing quantity can mean a placement condition *or* just that the source didn't list a count. So the site labeled seven ordinary items, like "Ribbon Cake," as conditions. Four of them had real counts on other habitats, so two pages of the site contradicted each other.

The fix keyed the one real placement condition by its name instead. The part I like is in the commit message:

> FR-004 encoded the false premise, so the spec carries the correction rather than leaving the next reader to reimplement the bug.

When the code and the spec disagree because the spec was wrong, fix the spec too. Otherwise the next agent will read the spec and faithfully rebuild the bug.

## Feature 003: art we were allowed to use

The third feature is the one I'm proudest of. Every habitat page needed a picture. The obvious source is the game itself, or the fan wikis' screenshots. But research found that no source allows redistributing those images: not the publisher, not the wikis.

So the site draws its own. Each habitat gets an original illustration, rendered as SVG when the page loads, built entirely from the habitat's list of required items. A grassy meadow if the list has tall grass, a kitchen if it has a cooking stove, a warmer tint if it has food. The picture is our drawing *of the listed items*, not a copy of the game.

![The Habitat Dex with a small scene illustration next to each habitat](/assets/img/posts/pokipedia/habitat-dex.png)
*The Habitat Dex. Each thumbnail is drawn from that habitat's build list: tall grass alone, then tall grass with a tree.*

Before writing the spec, there was a research round, and the numbers mattered. The obvious approach, one picture per main item, gave only **145 distinct scenes for 254 habitats**, with up to 12 habitats sharing the same picture. The final design, a terrain plus the *rarest* item as the main subject plus supporting items and modifiers, gave **253 distinct scenes out of 254**.

Picking the rarest item was the key idea. The build lists are full of generic furniture (a seat appears in 23 lists, a table in 20), so "draw the first item" would draw a table for every café. "Draw the rarest item" draws the pizza.

![A grid of scene thumbnails for fossil displays and café habitats, in light and dark themes, before and after enlarging the main subject](/assets/img/posts/pokipedia/scenes-before-after.png)
*Fossil displays and café habitats share the same furniture, so the subject does the work: a skull or a sail on the pedestal, tea, pizza or fries on the table. Each scene is shown before and after the subject was drawn bigger, in both themes.*

And the one remaining collision? Two habitats, "Pretty flower bed" and "Hydrated flower bed," had byte-identical build lists in the data. That looked wrong, so I checked in the game: the hydrated one also needs Water ×2. Fixing the data made all 254 scenes distinct.

The research also caught a trap that wouldn't have shown up in any count. Matching items by substring draws the wrong thing: "tree" is inside "streetlight," "mic" is inside "microscope," "table" is inside "vegetables." Those mistakes don't make any two scenes the same, so a distinctness test would pass. But drawing a tree for a streetlight means drawing something that isn't on the list, which breaks the whole reason the art is allowed. So matching uses the longest matching name, with an exceptions table, and a test checks it.

The research ended with a ready-to-paste `/speckit-specify` prompt, and that's how feature 003 started. `/speckit-analyze` then found six issues before any code was written: a model method with no test, a 120px size written as a literal instead of a token, a conflict between how the spec and the plan checked color contrast, and three smaller gaps. All six were fixed in the documents.

## Measure, don't eyeball

The pattern I noticed most across the commit history was the agent replacing its own impressions with measurements, sometimes after getting it wrong first.

After the Habitat Dex shipped, a second, deliberately skeptical audit found three layout bugs the first accessibility pass had missed. A habitat link on profile pages was 107×29px, under the 44px minimum. Cards in a grid painted up to 15px outside their own borders at widths the first check never tested. And a long Pokémon name made one page scroll sideways on a 320px phone. The commit also corrected an earlier claim:

> That earlier claim came from reading headless `--window-size=320` screenshots, which render at a desktop viewport and crop.

In other words, the first "fixed at 320px" was based on screenshots that weren't really 320px. The second time, every number came from measuring the page in the browser, before and after.

A performance test had the same arc. It originally asserted that a page loaded in under 50ms, which became 150ms when CI runners were slower. Then it failed on a pull request that changed one line of data, and passed on a rerun. The fix wasn't a bigger number. The test now measures the machine's own database round-trip time and checks that the page stays within 80 round trips. The agent also confirmed that the new test fails on a deliberately broken, one-query-per-tile version. A time limit can't tell a slow machine from a bad query. A ratio can.

## What I took from it

**The documents are the speed.** Feature 001 went from an empty repo to merged in one evening because the thinking happened in the spec and plan, where it was cheap to change.

**Make the constitution testable.** "Cozy and playful" isn't a rule. "Controls at least 44×44px" and "colors only from the tokens file" are, and both caught real bugs.

**Measure the risk before you design for it.** "Will derived art all look the same?" got a number (145 vs 253) before anyone drew a single symbol.

**Fix the spec when the spec is wrong.** It's the document the next agent will trust.

**Distrust screenshots and stopwatches.** Two of the best fixes in this project replaced something that looked right with something measured.

A few days after Pokipedia, I added a Spec Kit constitution to my school platform too. That's probably the clearest sign it worked.
