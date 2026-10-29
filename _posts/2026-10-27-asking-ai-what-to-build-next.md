---
title: "Asking an AI What to Build Next"
date: 2026-10-27T14:00:00-07:00
tags: [ai, claude, product, rails]
image: /assets/img/asking-ai-what-to-build-next/cover-light.png
image_dark: /assets/img/asking-ai-what-to-build-next/cover-dark.png
image_alt: "A one-line feature question, the schema, routes, controllers, jobs, Gemfile and 91 issues Claude read first, and its top three ideas: roll-over filed, CFDI still an idea, audit trail shipped in 9 days"
---

Ask an AI "what features should I add?" and you usually get a list that could fit any app: dark mode, a mobile app, AI-powered insights. I asked Claude that question about my school administration platform, and the answer was useful for once. One of its ideas shipped nine days later. The difference was what it read before answering.

## The question

The platform is a side project outside my day job: a Rails backend and a React Native app for schools in Mexico. After a few months of steady tickets, I wanted to step back and look for gaps instead of the next bug. So I opened a session in the Rails repo and typed one line:

> What other new features can I add to this school administration project?

That's the whole prompt. No list of constraints, no description of the product.

## What it did before answering

Before suggesting anything, Claude went through the repo: the models, the routes, the controllers, the background jobs, the Gemfile, and the full table list in `schema.rb`. Then it pulled every open issue from my GitHub board, all 91 of them, so it wouldn't suggest something I'd already planned. Then it grepped for specific things it suspected were missing: an audit gem, CSV exports, rooms, SMS or WhatsApp, Mexican electronic invoicing.

Its answer opened with:

> I read the schema, routes, controllers, and the 91 open issues on the board so these don't duplicate what's already tracked. Here's what's genuinely missing.

I didn't ask for any of that. But it's the reason the rest of the answer was worth reading, and it's what I look for now whenever I ask a question like this.

## Ideas that pointed at the code

Every idea came with evidence from my own codebase. A few of them:

**School-year roll-over.** "Today there's no path from one school year to the next." Starting a new academic period means recreating every group, reattaching every course and class schedule, and re-adding every student by hand. It added: "Every school hits this every June." That's true, and I hadn't thought about it.

**Invoices that aren't only tuition.** It pointed at the actual table: `tuition_invoices` is tied to a tuition plan, has one flat amount, and has a unique index on student, plan and due date. So there's no way to bill a uniform, a field trip, or a late enrollment fee. It also noted that three of its other ideas depended on this one.

**CFDI, Mexico's electronic invoicing.** This is the one I'd like to say I'd have found myself. It worked out who my users were from the code (currency defaults to MXN, Spanish is the default locale, the app supports CoDi bank payments) and concluded that schools in Mexico are legally required to issue CFDI receipts for tuition, which parents also need to deduct school costs from their taxes. Nothing in the codebase touched it. The closest thing on my board was a ticket called "Research invoicing services" from April 2025, with one bullet point in it.

**WhatsApp notifications.** The app already sends notifications in the app and by email through the Noticed gem. Its point was that parents in Mexico read WhatsApp and ignore email, so adding a third delivery channel to the existing notifiers is a small change that decides whether the messaging features get used at all.

**An audit trail.** "No `paper_trail` or equivalent." In an app that holds grades and money for several schools, "who changed this grade on March 3rd" is a question someone will eventually ask, and I couldn't answer it.

There were twelve in total, also covering class schedule conflicts, teacher absences, required-document checklists, attendance analytics and data export.

## It told me where it might be wrong

My favorite section was the one I'd never have thought to ask for. It was titled "Adjacent to existing tickets: check before filing," and it listed ideas that might already be on my board under a different name. An admissions pipeline might be what an old ticket called "Student enrollment feature" meant. ID cards with QR check-in might be "Create school credentials." It didn't decide either way. It told me which ticket to read first.

Then it ranked its top three, roll-over, CFDI and the audit trail, with a reason for each. The audit trail's reason was the one that got me:

> ...the one you'll regret not having retroactively, since it can't reconstruct history added before it exists.

It ended by offering to file whichever ones I picked through my `create-ticket` skill, which I wrote about in [the first post in this series](/2026/10/24/from-prompts-to-skills/).

## What happened next

**The audit trail shipped in nine days.** I filed it a week after that session. My `check-ticket` skill reviewed the ticket and found it was missing something: the uploaded personal documents (birth certificates, CURP, passports, medical files) weren't in the list of records to track, even though they're the most sensitive data in the app. It also asked what the log should say when a background job, not a person, changes a record, since there's no current user to blame. We settled on logging that a document was added or removed without ever recording its contents, and on a `system:<job_name>` label for job changes. Two days later the pull request was merged: PaperTrail on ten models, an Activity Log page for school admins, 959 lines added, and 2,132 tests passing.

**The roll-over became a smaller ticket.** I filed "Migrate school group from one academic period to the next one," with a twist the AI didn't suggest: whoever runs the migration chooses which students move on. It's still open, but it's on the board instead of in my head.

**CFDI and WhatsApp are still just ideas.** I haven't filed them yet. A good list doesn't mean building everything on it. It means I'm now choosing what to skip on purpose, instead of not knowing it was there.

## What I took from it

**A short prompt works when the agent has something to read.** I didn't need to explain my product, because the code and the board already did. My one line got good answers because the session was opened inside the repo, with access to the issues.

**Check what the answer is based on.** The first line of this answer told me what it had read. If an answer like this doesn't point to tables, files or tickets, I ask it to look first and answer again.

**Give it your backlog.** Reading the open issues is what kept it from suggesting things I'd already planned, and what let it say "check this ticket before filing."

**Ask for the ones it's least sure about.** The "check before filing" section saved me from filing duplicates. Next time I'll ask for it on purpose.

**File the winners, and let the rest wait.** The ideas that turned into tickets went through the same process as everything else: checked, questioned, built, reviewed. The ones I haven't filed are still in that session if I want them later.

I still decide what the product becomes. But I'm deciding from a list built on my own schema and my own board, which is a much better place to start than a blank page.
