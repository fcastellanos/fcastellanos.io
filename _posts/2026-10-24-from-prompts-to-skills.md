---
title: "From Prompts to Skills: How I Taught Claude Code My Workflow"
date: 2026-10-24T09:00:00-07:00
tags: [ai, claude-code, workflow, github]
image: /assets/img/from-prompts-to-skills/cover-light.png
image_dark: /assets/img/from-prompts-to-skills/cover-dark.png
image_alt: "A long prompt retyped every session becomes \"work on 131\", backed by create-ticket, check-ticket and work-ticket skills that hand off from one sentence to a PR"
---

For months I used Claude Code the way most people do: open a session, explain what I wanted, watch it work, correct it, and explain the same things again the next day. Then I turned that repeated explaining into a few small Markdown files called skills. Now "work on 131" is a complete instruction, and this post is about how I got there.

## The project

I'm building a school administration platform as a side project: a Rails app, a React Native (Expo) mobile client, and a GitHub Projects board that tracks everything as issues. I'm the only developer, so the board is my memory. Every bug, feature, and idea becomes a ticket that moves from Backlog to Ready, In progress, In review, and Done.

Claude Code does most of the typing now. My job is deciding what to build and reviewing what comes back.

## Before: the same prompt, every time

My early sessions all started with some version of this:

> Read issue 124, including the comments. Look at the code it mentions. Tell me your plan before changing anything. Then create a branch named after the issue, move the ticket to In progress, implement it, run the tests and RuboCop, open a PR that says "Fixes #124", and move the ticket to In review. Don't merge.

It worked, but only if I remembered every line. When I forgot one, I got a PR without the `Fixes` line, a branch cut from whatever branch I happened to be on, or a ticket still sitting in Ready when the work was done. Each mistake was small, but I kept fixing the same ones over and over.

The fix for most of them was the same: stop typing the procedure, and write it down once where the agent can find it.

## What a skill is

A skill is a folder in your repo with a `SKILL.md` file inside:

```
.claude/skills/
  work-ticket/SKILL.md
  check-ticket/SKILL.md
  create-ticket/SKILL.md
```

The file starts with a short front matter block. The `description` matters most, because Claude Code reads it to decide when the skill applies:

```markdown
---
name: work-ticket
description: Pick up a ticket from the School Admin board by issue number,
  issue URL, or board link. Assesses the ticket, confirms a plan with the
  user, moves it to "In progress", creates a numbered branch, implements
  the work, and opens a PR for review.
---
```

Below that is plain Markdown, with numbered steps and the exact commands I'd otherwise type. There's no framework or plugin to install. Because the skill lives in the repo, it gets versioned and reviewed like any other code.

## The first skill: work-ticket

I wrote `work-ticket` at the end of July. It was mostly my old prompt, cleaned up and split into steps:

1. Turn the reference into an issue number (a bare `124`, an issue URL, or a board link).
2. Read the ticket, *including the comments*, since that's where scope changes live.
3. Look into the code.
4. Write an assessment and a step-by-step plan.
5. **Stop and ask me to confirm.** Nothing changes before I say yes.
6. Move the board item to In progress.
7. Create a branch named `<number>-<short-description>`.
8. Implement.
9. Run the tests and RuboCop.
10. Open the PR with `Fixes #<number>` and move the item to In review.

It ends with two guardrails I care about more than any single step:

```markdown
## Guardrails
- Never push directly to `main` and never merge the PR yourself.
- If the plan needs to change significantly mid-implementation, pause
  and re-check with the user before continuing.
```

After that, my prompts got very short. "Work on 131" was enough.

## Skills grow from corrections

What I didn't expect was how the skills would change over time. Almost every edit started as a correction I made during a session, which I then wrote into the file so I'd never have to make it again. From the git history:

- **Same night:** "Check the current branch before creating a new one," so it never branches off something I'm halfway through.
- **Same night:** a merge step, but only after I explicitly say the PR is reviewed and approved.
- **Three weeks later:** "Check CI before merging." My "yes, merge it" shouldn't count if a check went red after I said it.
- **September:** size the investigation to the ticket. For a one-file fix, read the file directly instead of starting a search subagent, and run only the tests you touched unless the change is broad.
- **Late September:** the board passed 500 items, and the way the skill looked up a ticket's board entry quietly stopped working. The fix was to ask the issue for its board item instead of listing the whole board.

None of these were planned. Each one was a moment where I thought "I've told it this before," and the right response was to edit the file instead of the prompt.

## Splitting the job: create, check, work

Once `work-ticket` was solid, the same pattern showed up at the other end of the board. Tickets I'd filed months earlier were often stale. The bug had already been fixed, or the file the ticket mentioned no longer existed.

So I added `check-ticket`. It reads a ticket, investigates whether it's still true, and does one of two things:

- If it's no longer valid, it posts a comment with the evidence (a file and line, a merged PR, a duplicate issue) and *asks* whether to close it.
- If it's still valid but missing something, like repro steps or acceptance criteria, it comments with exactly what's missing and offers to hand off to `work-ticket`.

Then I added `create-ticket`, which turns one sentence into an issue on the board in Backlog. It deliberately does very little itself. Its last step is to call `check-ticket` on the new issue, so the investigation logic lives in one place instead of two.

The result is a pipeline that matches how I already thought about the board:

```
one sentence ──> create-ticket ──> check-ticket ──> work-ticket ──> PR
                  (file it)        (is it real?    (plan, branch,
                                    what's missing?) build, test)
```

Here's a real run. I typed:

```
/create-ticket Ability to delete cancelled events from calendar
```

A minute later I had issue #1073 in Backlog with a follow-up comment from `check-ticket` raising three things to settle first: only allow deleting a meeting that's already cancelled, add the first action to the cancelled-meeting card, and reuse the refresh pattern from the PR that had just landed so we wouldn't reintroduce a stale-calendar bug. I answered the three questions in one message, and it added my decisions to the ticket.

## The mobile app got its own copy

The mobile repo has the same three skills, adapted to its own board and with one important addition. The mobile app is a client for the Rails API, so before filing a ticket, `create-ticket` checks whether the request can actually be built against the existing API contract:

```markdown
If backend work looks needed, stop and tell the user what appears to be
missing and why (cite the specific endpoint/field gap), then ask for
explicit confirmation on how to proceed. Do not create the issue until
they confirm.
```

That one paragraph has saved me from filing mobile tickets that couldn't be built yet.

## What I've learned

**Start with the prompt you keep retyping.** My first skill was a cleaned-up copy of a prompt I already used every day. You don't need to design anything up front.

**Edit the skill, not the session.** When the agent gets something wrong in a way it'll get wrong again, fix it in the file. Corrections in chat disappear when the session ends; corrections in the file stay.

**Keep each skill small and hand off.** `create-ticket` doesn't investigate, it calls `check-ticket`. Small skills that call each other are easier to fix than one big one.

**Write guardrails as rules, not suggestions.** "Never merge without explicit confirmation" and "never close an issue based only on this skill's assessment" are the lines that let me trust the rest. The agent handles the steps; the irreversible decisions stay with me.

**Put the commands in.** Exact `gh` commands with the real project number make the skill both reliable and fast. The agent doesn't have to rediscover how my board works every time.

I've since added skills for pre-merge reviews, visual mockups, and keeping Dependabot PRs moving, and I'll write about some of those next. They all started the same way, as a prompt I was tired of typing.
