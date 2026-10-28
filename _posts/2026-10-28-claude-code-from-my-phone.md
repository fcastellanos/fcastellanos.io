---
title: "Planning an App Store Release from My Phone"
date: 2026-10-28T15:30:00-07:00
tags: [ai, claude, mobile, expo]
---

Most of my coding with Claude happens at my desk, in VS Code. But some of my most useful sessions on my side project started on my phone, away from the desk, with a question I didn't want to forget. Claude Code runs in the cloud from the Claude app on iOS: it clones the repo, reads the code, and works on GitHub, while I type on a phone keyboard. This post is about what that's good for, using one real session, and the one thing that didn't work.

## The question

My side project, a school administration platform I build outside my day job, has a React Native app built with Expo. It works in development builds, and it had never been near an app store. One day in September I opened the Claude app on my phone, picked the mobile repo, and typed:

> What do I need to do to publish this app in the Apple App Store and whatever is used for Android?

"Whatever is used for Android" is a phone-keyboard question. I knew it was Google Play. I just didn't want to type more than I had to.

## What it did with a lazy question

It didn't answer from general knowledge. It went through the mobile repo first: `package.json`, `app.json`, `eas.json`, the env config, the screens, the icon files, the CI workflow. Then it looked at the Rails repo for the privacy policy page and the API environments doc, and at the open issues on my mobile board.

The answer started with what was already done, and that part was more reassuring than I expected. The bundle IDs were set, the store icon was the right size with no transparency, and the app uses no camera, location, photos or push, so there were no permission prompts to explain to reviewers.

Then came the blockers, and the first one would have hurt:

> **Production API URL isn't wired anywhere.** `src/config/env.ts` throws at startup if `EXPO_PUBLIC_API_BASE_URL` is missing, and it only comes from `.env.local`, which is gitignored and never reaches EAS build servers. A store build today would crash on launch.

My first store build would have crashed on launch, and I'd have found out from App Review. It found that by reading one config file and one `.gitignore`, from a question I typed with my thumbs.

The rest of the list was just as specific:

- `eas.json` had only a `development` profile, with no production build profile and no submit config.
- No build numbers. Its suggestion: let EAS manage them remotely and auto-increment.
- `supportsTablet: true` means Apple requires iPad screenshots *and* an app that really works on iPad. If I hadn't tested iPad layouts, turning it off before the first submission was cheaper.
- No `expo-updates`, so every JavaScript-only fix would need a full store review.

## The parts I didn't know to ask about

The best part of the answer wasn't about my code. It was the review risks that are specific to this kind of app:

- **Demo credentials.** The app is login-only with no sign-up, so Apple's reviewers can't get past the first screen without a working demo account, pointed at a demo school with realistic but fake data. Without it, it's a rejection.
- **"Minimum functionality."** Most screens are read-only lists. Apple does reject legitimate business apps for that, so it said to be ready to explain that the app is a companion to a real web product.
- **What's *not* a problem.** Account deletion rules only apply to apps that let you create an account, and mine doesn't. In-app purchase rules don't apply either, because the app takes no payments.
- **Google Play's audience question.** The app processes minors' data, but its users are school staff. Declaring it as directed to children would pull it into Google's much stricter Families policy.
- **A different way to ship.** Since this is software for school staff, private distribution through Apple Business Manager and Managed Google Play would avoid most of the public review scrutiny.

On anything that changes often, like Google's testing requirement for new personal developer accounts or Play's target API level, it said to check the current rule before relying on it. That's the kind of hedge I want, in the places where it belongs.

It also flagged accounts and paperwork as the slowest part: a D-U-N-S number to enroll as a business can take a week or two, so start there and do the code changes while you wait.

## From answer to tickets, still on the phone

The iOS side was already on my board as an epic with six tickets. Android had nothing. It asked whether I wanted the Android work filed, and I replied with five words: "Yes file for Android".

It ran my `create-ticket` skill and filed an epic with six sub-tickets: the Play Console account, the EAS production build and submit config, version codes, store listing assets (including a 1024×500 feature graphic that nothing in the repo could be cropped into), the Data Safety and content rating forms, and the testing tracks. Each one cross-referenced its iOS twin where the two should stay consistent.

The whole session, from the first question to a new Android epic with six tickets, took about twenty minutes.

## What didn't work from the phone

Filing the issues worked. Putting them on my project board didn't.

GitHub Projects (the board) can only be edited through GitHub's GraphQL API, and the cloud environment the session ran in blocks GraphQL. So the issues existed in the repo but weren't on the board, and the Priority, Size and Estimate fields my `check-ticket` skill normally sets couldn't be set either. The agent didn't pretend otherwise:

> **Board placement failed.** ... The issues exist in the repo but are **not on the board and not in Backlog** — you'll need to add the six and set their column, or let me do it from a session with GraphQL access.

That's a fair trade, and I'd rather be told plainly than discover it later. But it means a phone session can create work that still needs a few minutes at the desk.

## How I use the phone now

Looking at my sessions, the ones I start from the phone have a pattern. They're questions, research, and planning:

- "What do I need to publish this app?" (this session)
- "What other features can I add?" (the brainstorm from [an earlier post](/2026/10/27/asking-ai-what-to-build-next/))

Neither one changed a line of code. They read the repo, answered with evidence, and turned the answer into tickets. Writing the code, reviewing PRs, and anything that touches the board's fields still happens at the desk, in VS Code.

## What I took from it

**A phone is enough for a good question.** The agent does the reading. My question was one sloppy sentence, and the answer cited specific files, because the session had the whole repo.

**Ask "what am I missing" questions away from the desk.** The best findings in this session were things I didn't know to ask about. Those questions come up at random times, and the phone means they get answered instead of forgotten.

**Turn the answer into tickets before you put the phone down.** A great answer in a chat is easy to lose. Tickets in the repo are not.

**Know what the environment can't do.** The cloud session couldn't touch my project board. It said so clearly, and now I know to finish that part at the desk.

The app still isn't in either store, and all twelve sub-tickets are still open. But I know exactly what's left, I know the first build would have crashed on launch, and I worked all of that out without opening my laptop.
