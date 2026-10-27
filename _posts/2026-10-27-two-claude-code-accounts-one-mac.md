---
title: "Work and Personal Claude Accounts in VS Code"
date: 2026-10-27T10:00:00-07:00
tags: [ai, claude, macos, vscode]
---

I use Claude for two kinds of coding: my day job, on my employer's team plan, and a school administration platform I build as a side project, on my own personal plan. Both happen on the same Mac, and almost all of it happens in the Claude extension in VS Code. One day I asked Claude in my side project, "what Claude account am I using?", and it answered with my work account. Here's how I got VS Code to use the right account for each, and the two surprises along the way.

## Why it matters

Keeping them apart isn't just tidiness. I didn't want anything from my personal project, its code, conversations, or the artifacts Claude creates along the way, sitting in my employer's Claude account. The reverse matters even more: work shouldn't leak into my personal account. And work usage should be billed to the work plan, personal usage to mine.

I'd assumed they were already separate, because the Claude desktop app showed my personal account. The VS Code extension didn't agree.

## How the extension decides which account to use

The VS Code extension has its own sign-in, separate from the Claude desktop app and from claude.ai in the browser. It stores that sign-in, along with its settings and history, in a config folder: `~/.claude` by default. Whoever signed in there last is who you are in every VS Code window.

The folder can be changed with an environment variable, `CLAUDE_CONFIG_DIR`. Give each account its own folder and they stop sharing anything:

```
~/.claude-work       # work account
~/.claude-personal   # personal account
```

The hard part is getting VS Code to pass the right value to the extension.

To check where you stand at any point, ask Claude in the panel which account it's using, or run `/status`.

## Surprise #1: VS Code ignores your shell, and your workspace settings

My first instinct was to set `CLAUDE_CONFIG_DIR` the usual ways. Neither worked.

- **In `~/.zshrc`.** VS Code opened from the Dock or Spotlight never reads your shell config, so the extension never sees the variable.
- **In the workspace's `.vscode/settings.json`**, under `terminal.integrated.env.osx`. This one looks like it should work, and you'll find guides that recommend it. It only applies to new terminal tabs inside VS Code. The Claude panel never reads it.

The extension takes its environment from the VS Code app itself, at the moment the app starts. So the only reliable fix is to control how VS Code is launched.

## The fix: open VS Code with the account you want

I have two aliases. Each one launches VS Code with a different config folder:

```bash
# ~/.zshrc
alias code-work='CLAUDE_CONFIG_DIR=~/.claude-work code --user-data-dir ~/.vscode-work'
alias code-personal='CLAUDE_CONFIG_DIR=~/.claude-personal code'
```

Now `code-personal <side-project-folder>` opens my side project with the Claude panel on my personal account, and `code-work` opens VS Code with the panel on my work account. Both can be open side by side.

The `--user-data-dir` flag on `code-work` matters. If VS Code is already running, `code` from a terminal doesn't start a new app. It opens a new window in the running one, and that window keeps the account the app started with. A separate `--user-data-dir` forces a fully separate VS Code instance, with its own settings and extensions in `~/.vscode-work`, that reads the environment it was launched with.

`code-personal` doesn't have one, so it uses my regular VS Code. That creates one catch: it only gets the personal account if it's the command that starts my regular VS Code. If that VS Code is already open, for example from the Dock, `code-personal` just adds a window to it, on whatever account it started with. I start my personal VS Code with `code-personal`. If you'd rather not think about it, give both aliases their own `--user-data-dir`.

## A default for when I click the Dock icon

VS Code still gets opened from the Dock or Spotlight now and then, and I wanted that to land on a known account instead of whatever `~/.claude` held. Apps opened from the Dock take their environment from `launchctl`, so I set the default there with a small LaunchAgent that runs at login:

```xml
<!-- ~/Library/LaunchAgents/local.setenv.claude-config-dir.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>local.setenv.claude-config-dir</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/launchctl</string>
    <string>setenv</string>
    <string>CLAUDE_CONFIG_DIR</string>
    <string>/Users/you/.claude-work</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
```

Use the full path, since `~` isn't expanded in a plist. Two more things cost me time:

- **Quit VS Code completely** (Cmd+Q), not just the window. A running VS Code keeps the environment it started with.
- **Expect to sign in again.** After switching folders, the extension asked me to sign in even though the files had just moved. The saved sign-in is tied to the folder path.

## Surprise #2: signing in picked the wrong account anyway

With the personal folder wired up, I signed in and asked Claude which account it was using. It said work, again.

The folders were fine. The personal one had its own files, separate from the work one. The problem was the sign-in. It opens the browser to authorize, and my browser was already signed in to claude.ai with my work account. The authorization page went straight through with that session, without asking which account I wanted, and the work account's sign-in landed in the personal folder.

The fix:

1. In the personal VS Code, sign out (`/logout`).
2. Sign in again, and finish the browser step in a **private window** or a different browser that isn't signed in to your work account.
3. Ask Claude which account it's using, or run `/status`.

After that, my side project was finally on my personal account.

## The setup now

| How I open VS Code | Claude account |
| --- | --- |
| `code-personal <folder>` | Personal |
| `code-work <folder>` | Work |
| Dock or Spotlight | Work (the LaunchAgent default) |

## What I'd tell someone setting this up

**Check, don't assume.** The desktop app, the website, and the VS Code extension can each be signed in to a different account. Ask Claude in the panel which one it's using before you trust it.

**Separate by config folder.** `CLAUDE_CONFIG_DIR` keeps settings, history, and sign-in apart in one move.

**Control how VS Code starts.** The extension only sees the environment VS Code launched with. Shell config and workspace settings won't reach it, but an alias that launches VS Code will.

**Sign in from a clean browser.** If your browser is signed in to the other account, the sign-in can quietly use it.

None of this was hard once I knew where to look. It just wasn't where I expected.
