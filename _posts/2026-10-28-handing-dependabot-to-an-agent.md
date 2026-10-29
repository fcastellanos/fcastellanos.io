---
title: "Handing Dependabot to an Agent, and the PR It Rightly Refused"
date: 2026-10-28T14:00:00-07:00
tags: [ai, claude, dependabot, rails]
image: /assets/img/handing-dependabot-to-an-agent/cover-light.png
image_dark: /assets/img/handing-dependabot-to-an-agent/cover-dark.png
image_alt: "Six Dependabot PRs pass through the /maintain-dependabot-prs skill: four merge, one is rerun once, and the json 3.0 bump is closed"
---

Dependabot is great at opening pull requests and terrible at telling you which ones matter. On my side project, a Rails app I build outside my day job, it opens a handful every week. I used to click through them one by one. Now I type `/maintain-dependabot-prs` in the Claude panel in VS Code and read a table. This post is about that skill, the day it hit 337 failing tests, and the PR it closed instead of fixing.

## The skill

It's a single `SKILL.md` file in the repo, like the ones I described in [the first post in this series](/2026/10/24/from-prompts-to-skills/). It does five things:

1. List the open PRs, and keep only the ones that are really from Dependabot: the author has to be `app/dependabot` *and* the branch has to start with `dependabot/`.
2. Check each PR's CI and sort it into eligible, waiting, failed or blocked.
3. Squash-merge the eligible ones, after checking again right before the merge.
4. Rerun failed GitHub Actions jobs, once.
5. Report back in a table.

Most of the file is rules about what *not* to do. A PR is eligible only if it's clean, not waiting on a review, and every check passed. "Treat skipped or neutral checks as non-passing." "Never infer success from a partial check list." The merge pins the commit it checked:

```bash
gh pr merge <number> --squash --delete-branch --match-head-commit <headRefOid>
```

And the guardrails at the bottom:

```markdown
- Never use admin merge or push directly to a Dependabot branch.
- Never rerun the same workflow run more than once per invocation.
- Never loop or wait indefinitely for CI.
```

The rerun limit sounds fussy. It turned out to be the most useful line in the file.

## A normal run

One Monday there were five open PRs: resend, rubocop, selenium-webdriver, mission_control-jobs and stripe. One command later I had this:

| PR | Result |
| --- | --- |
| Bump resend | Merged |
| Bump rubocop | Waiting (tests still running) |
| Bump selenium-webdriver | Merged |
| Bump mission_control-jobs | Rerun (tests failed, rerun triggered) |
| Bump stripe | Merged |

Three merged, one waiting, one retried. That's the whole point of the skill: the boring ones disappear, and I only look at what's left.

## 337 errors on two unrelated bumps

I came back later and told it "two of them are still failing." Both rubocop and mission_control-jobs had failed with exactly the same thing:

```
Api::V1::BaseController#authenticate_api_user!
ArgumentError: wrong number of arguments (given 2, expected 1)
1793 runs, 3416 assertions, 2 failures, 337 errors, 3 skips
```

A linter upgrade and a job dashboard upgrade, breaking API authentication in the same way, with the same counts. This is where the rerun limit paid off. mission_control-jobs had already used its one rerun, so the agent didn't try again. It said so and went to read the logs instead:

> Same 337 errors / 2 failures count in both runs, same root cause, same line... not a flaky check worth blindly rerunning again.

Without that rule, the easy move is to keep pressing rerun and hope.

## The first diagnosis was wrong

I'll be honest about this part. The agent's first theory was that both branches were stale: their lockfiles predated the three PRs it had just merged, and the same test passed on `main`. So it commented `@dependabot rebase` on both and told me to check back.

That was a reasonable guess, and it was wrong. Rebasing didn't fix anything. The next day we found the real cause: the rubocop upgrade let Bundler pull in **json 3.0.2** along the way. Nothing in my Gemfile limited the json version, and json 3.0 is a breaking major release. json is loaded by Rails itself, so the break showed up everywhere JSON gets parsed, including the JSONB-backed settings that code all over the app reads, API authentication among them. None of it had anything to do with rubocop.

The fix was one line and a comment, added to the rubocop PR before merging it:

```ruby
# Pinned below 3.x: json 3.0 is a breaking major bump that gets pulled in transitively
# by unrelated gems (e.g. rubocop) since nothing else in this Gemfile constrains it.
gem "json", "~> 2.21"
```

With that on `main`, mission_control-jobs went green and merged a few minutes later.

The comment matters as much as the pin. Without it, the pin is a mystery line someone will "clean up" one day. That someone could be me, or the next agent.

## A day later, Dependabot came back for json

Of course it did. Dependabot saw a pinned gem with a newer version available and opened a PR to bump `json` to `~> 3.0`. CI failed with the same `wrong number of arguments` error. I asked: "help me figure out how to fix the issue on PR 1134."

"Fix" was my word, and it would have been easy to take it literally. The agent did something better. It read the Gemfile first, and started its answer with:

> The PR doesn't just bump the `json` gem — it removes a deliberate guardrail.

Then it checked that the break was real and not just CI. It installed json 3.0.2 locally and reproduced the failure outside any controller test:

```ruby
Noticed::Event.create!
# ArgumentError: wrong number of arguments (given 2, expected 1)
```

That showed the problem wasn't one controller. Basic record creation broke. The answer was not to patch the app around json 3.0, but to close the PR. It closed it with a comment pointing back to the pin:

> Closing: this bumps `json` past the intentional `~> 2.21` pin in the Gemfile (see the comment there), which was added specifically because json 3.x is a breaking change that Rails 8.1.3.1 doesn't yet handle.

It also offered to add an `ignore` rule to the Dependabot config so the PR wouldn't come back. I said no. I'd rather see the next json 3.x release and decide then. It noted that if the PR comes back, the fix is the same: close it and point to the pin.

## What I took from it

**Write the guardrails before you need them.** "Rerun once" is what turned a flaky-looking failure into an investigation. Without a limit, retrying is always the easiest thing to do.

**Identical failures on unrelated changes point to something shared.** Two unrelated gems failing with the same error and the same counts means the cause is something they have in common: the lockfile, a shared dependency, the base branch. Here it was a gem neither PR mentioned.

**Agents guess wrong too, so check what happened after.** The stale-lockfile theory was plausible and confidently stated. What caught it was looking at the result of the rebase instead of assuming it worked.

**A pin needs a reason next to it.** The comment I added on Tuesday is what the agent read on Wednesday. Write it for the next reader, human or not.

**Sometimes the right fix is to close the PR.** I asked for a fix and got a refusal with evidence. That's the answer I want from an agent when the request itself is the problem.

Dependabot still opens its PRs every week. Most of them now take me as long as it takes to read a table.
