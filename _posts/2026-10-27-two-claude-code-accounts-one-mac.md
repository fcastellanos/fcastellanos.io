---
title: "Two Claude Code Accounts, One Mac"
date: 2026-10-27T10:00:00-07:00
tags: [ai, claude-code, macos, vscode]
---

I use Claude Code for two things: my day job, on my employer's team plan, and a school administration platform I build as a side project, on my own personal plan. They run on the same Mac. One day I asked Claude a simple question in my side project, "what Claude account am I using?", and the answer was my work account. Here's how I separated the two, and the two surprises along the way.

## Why it matters

Keeping them apart isn't just tidiness. Work usage should go to the work plan, and personal usage to mine. My side project's code and conversations shouldn't end up in my employer's workspace, and the reverse matters even more. I'd assumed they were separate because the Claude desktop app showed my personal account. Claude Code didn't agree.

## First, find out which account you're actually using

The desktop app's account menu and Claude Code are signed in separately. Claude Code has its own login, stored in its own config folder (`~/.claude` by default), so the two can easily point at different accounts.

The quickest check is to ask Claude Code itself, or run `/status` inside it. If you'd rather look yourself, with the default setup the signed-in account is in `~/.claude.json`:

```bash
python3 -c "import json,os; a=json.load(open(os.path.expanduser('~/.claude.json')))['oauthAccount']; print(a['emailAddress'], a.get('organizationName'))"
```

Mine printed my work email and my employer's organization, in what I thought was a personal session.

## The fix: one config folder per account

Claude Code reads an environment variable, `CLAUDE_CONFIG_DIR`, that tells it where its config lives. That includes settings, history, and which account is signed in. Give each account its own folder and they stop sharing anything:

```
~/.claude-work       # work account (the default)
~/.claude-personal   # personal account
```

I made work the default, since that's where I spend most of the day, and added an alias for personal:

```bash
# ~/.zshenv
export CLAUDE_CONFIG_DIR="$HOME/.claude-work"

# ~/.zshrc
alias claude-personal='CLAUDE_CONFIG_DIR="$HOME/.claude-personal" claude'
```

Now `claude` in a terminal is work and `claude-personal` is personal. Each folder gets its own `/login`.

The terminal was easy. VS Code wasn't.

## Surprise #1: the VS Code panel ignores your shell

I mostly use Claude Code through the VS Code extension panel, not a terminal. The extension doesn't read `~/.zshenv` or `~/.zshrc`. It inherits its environment from the VS Code app itself, at the moment the app launches.

That rules out a few fixes you'll find online. Setting `CLAUDE_CONFIG_DIR` under `terminal.integrated.env.osx` in a workspace's `.vscode/settings.json` looks like it should work, and it does, for the integrated terminal. New terminal tabs in that workspace get the variable, so typing `claude` there uses the right folder. The extension panel never reads that setting, no matter how many times you restart.

To reach the panel, the variable has to be set where macOS GUI apps pick it up, with `launchctl setenv`. That only lasts until you log out, so I made it stick with a small LaunchAgent that runs at login:

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

Use the full path. `~` isn't expanded in a plist. Then a few things that cost me time:

- **Quit VS Code completely** (Cmd+Q), not just the window. A running VS Code keeps the environment it started with.
- **Expect to log in again.** After the move, Claude Code asked me to sign in even though the files were the same. The saved login is tied to the config path, and the path had changed.
- **It's one account for the whole app.** Because the panel reads the app's environment, every VS Code window gets the same account. You can't switch the panel per project with a setting.

For that last one, I use the terminal: `claude-personal` in my side project's integrated terminal, and the panel for work. The other option is a second VS Code install (such as VS Code Insiders) launched with the personal folder, so each app has its own account. I haven't needed it yet.

## Surprise #2: the login used the wrong account anyway

With everything wired up, I ran `claude-personal`, logged in, and asked which account it was using. It said work again.

The folders were fine. `~/.claude-personal` had its own files, separate from `~/.claude-work`. The problem was the login itself. `/login` opens the browser to authorize Claude Code, and my browser was already signed in to claude.ai with my work account. The authorization page went straight through with that session, without asking which account I wanted. The work account's login ended up in the personal folder.

The fix:

1. Run `claude-personal`, then `/logout`.
2. Run `/login` again, and finish the browser step in a **private window** or a different browser that isn't signed in to your work account.
3. Ask Claude Code which account it's using, or run `/status`.

After that, it showed my personal account.

## The setup now

| Where I run Claude Code | Account | How |
| --- | --- | --- |
| VS Code panel | Work | `launchctl setenv` from a LaunchAgent |
| `claude` in any terminal | Work | `CLAUDE_CONFIG_DIR` in `~/.zshenv` |
| `claude-personal` in any terminal | Personal | alias that overrides `CLAUDE_CONFIG_DIR` |

## What I'd tell someone setting this up

**Check, don't assume.** The desktop app, the website, and Claude Code can each be signed in to a different account. Ask Claude Code which one it's using before you trust it.

**Separate by config folder.** `CLAUDE_CONFIG_DIR` keeps settings, history, and login apart in one move.

**GUI apps don't read your shell config.** If the VS Code panel matters, set the variable with `launchctl` and fully restart the app.

**Log in from a clean browser.** If your browser is signed in to the other account, the login can quietly use it.

None of this was hard once I knew where to look. It just wasn't where I expected.
