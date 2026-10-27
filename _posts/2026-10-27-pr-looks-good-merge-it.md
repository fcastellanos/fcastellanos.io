---
title: "\"PR Looks Good, Merge It\": Reviewing Code I Didn't Type"
date: 2026-10-27T08:00:00-07:00
tags: [ai, claude-code, code-review, workflow]
---

The message I send most often to Claude Code is five words long: "PR looks good, merge it." That sounds like rubber-stamping, but it's actually the end of a review. This post covers what happens before I type it, and what still happens after.

In [the last post](/2026/10/24/from-prompts-to-skills/) I explained how my ticket workflow became a few small skills. Those skills end the same way: the agent opens a pull request, moves the ticket to In review, and stops. It can't merge until I say so. This post is about that pause.

## I'm the only reviewer

I build a school administration platform on my own: a Rails backend and a React Native app. There's no team and no second pair of eyes. Claude Code writes most of the code, and I'm the only person between a PR and production.

That changes what reviewing means. I'm not checking a colleague's style. I'm checking whether the change does what the ticket asked, whether it does anything the ticket didn't ask for, and whether I understand it well enough to own it at 2 a.m.

## What a good PR hands me

The biggest improvement in my reviews didn't come from reading diffs more carefully. It came from the PR summary. When the agent finishes, it tells me what it changed, how it checked the change, and anything that surprised it. The surprises are the part I read first.

A layout fix for a sidebar that shrank in the calendar view came back with this:

> My first browser check with an empty calendar didn't reproduce the bug... I found a teacher account with real recurring course events, reproduced the sidebar shrinking from 208px to 139px on Month view with the original code, then confirmed it stays at 208px with the fix.

That paragraph tells me more than the two-class diff does. The obvious test didn't reproduce the bug, so it found data that did, and it measured before and after. I'd have accepted the diff anyway, but now I trust it.

Another PR fixed a data-scoping bug so that teachers and parents only see their own records. The summary started with "Notably, fixing the scoping surfaced a real bug along the way." The new query combined `DISTINCT` with ordering by a joined column, which Postgres rejects. It would have broken the page for every non-admin user as soon as the fix shipped. The agent caught it, fixed it, and called it out at the top instead of hiding it in the diff.

So the first thing I read isn't the code. It's the "notably", the "worth noting", and the test numbers (`1616 runs / 0 failures, rubocop clean`). If something unexpected happened, that's where I look hardest.

## Then I read the diff against the plan

Before any code gets written, my workflow has the agent post a plan and wait for my approval. That plan is what I review against. I'm asking three questions:

1. **Did it do what we agreed?** Files changed that weren't in the plan get a closer look.
2. **Did it do more than we agreed?** Drive-by refactors are the most common thing I push back on. My `CLAUDE.md` says to file those as separate tickets instead of folding them into unrelated PRs.
3. **Could I explain this change to someone else?** If not, I ask. It's cheaper to ask now than to reverse-engineer it later.

## A reviewer that knows my rules

Generic AI code review catches generic problems. Mine are specific. Every controller action in the Rails app has to go through Pundit authorization. Every lookup has to be scoped to the current school, never a bare `Model.find(params[:id])`. Every foreign key needs an index, because the schema has 100% coverage today and I want to keep it. In the mobile app, network responses get parsed, never cast with `as SomeType`.

A generic reviewer doesn't know any of that, so I wrote it down. Both repos have a `review-pr` skill: a checklist of *my* conventions, with the reasons. The Rails one even says what not to bother with:

```markdown
`bin/brakeman` covers raw SQL/injection, XSS, mass assignment, and
CSRF-skip detection app-wide; don't hand-derive those in Step 4 below.
```

The mobile one asks for a verdict up front (**Ready to merge**, **Merge after fixes**, or **Needs rework**) and tells the reviewer to drop anything it can't point to a line for: "Prefer five real findings over twenty speculative ones."

Both skills share one rule: the reviewer never edits code, never approves, and never posts to the PR without showing me the text first. It's a second opinion, not a second author.

## Pushing back is part of the loop

"Looks good" isn't always my first reply. One PR added a coverage badge to the README, and the second version came with a Ruby class, a rake task, and tests to generate a tiny JSON file. I asked: "Do we still need the coverage.rake, coverage_badge.rb, the test file, etc.?"

The answer was no. The only parts that mattered were one CI step and one line in the README, and `jq` could do the rest inline. The PR got smaller, and so did the code I have to maintain. The agent tends to build properly. Sometimes my job is to ask whether "properly" is more than this needs.

## Merging isn't the end

Saying "merge it" kicks off a few steps I no longer do by hand. The agent checks CI first. If a check went red after I approved, it tells me instead of merging. The mobile skill goes one step further and merges only the exact commit I reviewed:

```bash
gh pr merge <n> --merge --match-head-commit <headRefOid>
```

If anything was pushed after my review, the merge fails instead of shipping code I haven't seen.

Then it tidies up. After one merge it noticed the PR had shipped the last open item in an epic. The epic's checklist was stale because GitHub doesn't update plain Markdown checkboxes, so it offered to update the checklist and close the epic. I said yes.

The most useful follow-through came after a production deploy failed halfway. A migration tried to remove columns that, it turned out, had never existed in production; they only lived in `schema.rb` and dev databases. Fifteen of sixteen migrations had applied. The agent explained exactly what state production was in, opened a fix with `column_exists?` guards, and when I said "merge it" it answered with:

> Redeploy now... Ping me when the deploy finishes and I'll verify: migrations complete, `organization_id` populated with no NULLs across the 9 tables, new indexes/FKs/unique constraints present, and the app responding.

I deployed and said so, and it ran the checks. The deploy button stayed mine, and the verification checklist became its job.

## What stays with me

Splitting the work this way has made one thing clear. The agent is very good at everything up to a decision, and I make the decisions:

- **Approving the plan** before any code is written.
- **Saying "merge it"** after I've read the summary and the diff.
- **Deploying to production.** The agent prepares and verifies; I press the button.
- **Closing issues.** My skills comment with evidence and ask, but never close on their own.
- **Saying no.** Sometimes the agent says no too. It once refused to "fix" a Dependabot PR that upgraded a gem past a version my Gemfile explicitly pinned, and recommended closing it. It was right.

## What I've learned

**Read the summary before the diff.** The surprises the agent reports are where the risk is. If a PR summary has no "notably" and no test numbers, ask for them.

**Review against the plan, not just the code.** An approved plan gives you something concrete to compare against. Anything outside it gets questioned.

**Write your conventions down for the reviewer too.** A `review-pr` skill with your rules catches what a generic reviewer can't, and it can skip what your linters already cover.

**Make the merge pin to what you reviewed.** "Merge it" should mean merging the commit I looked at, with green CI, and nothing else.

**Keep the irreversible buttons.** Merging, deploying, and closing are cheap for an agent and expensive to undo. They're the ones I keep for myself.

"PR looks good, merge it" is short because the work behind it is done by then. The agent did the typing, the testing, and the reporting, and I did the deciding.
