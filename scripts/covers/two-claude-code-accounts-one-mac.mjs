// Header image for "Work and Personal Claude Accounts in VS Code": two VS Code
// windows launched by two aliases, each with its own CLAUDE_CONFIG_DIR.
import { h, brand, canvas, mono, label, badge, dot, arrow } from "../theme.mjs";

export const post = "2026-10-27-two-claude-code-accounts-one-mac";

const windowMock = (t, { alias, dir, account, color }) =>
  h({ width: 500, flexDirection: "column", borderRadius: 14, overflow: "hidden", backgroundColor: t.surface, border: `1.5px solid ${t.border}` }, [
    h({ alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderBottom: `1.5px solid ${t.border}` }, [
      dot("#ff5f57"), dot("#febc2e"), dot("#28c840"),
      h({ marginLeft: 12, fontSize: 15, color: t.muted, fontWeight: 500 }, "Visual Studio Code"),
    ]),
    h({ flexDirection: "column", gap: 14, padding: "20px 22px 24px" }, [
      h({ alignItems: "center", gap: 10 }, [
        mono({ fontSize: 16, color: t.muted }, "$"),
        mono({ fontSize: 19, color: t.fg }, alias),
      ]),
      h({ padding: "10px 14px", borderRadius: 10, backgroundColor: t.pill }, [
        mono({ fontSize: 15, color: t.accent }, `CLAUDE_CONFIG_DIR=${dir}`),
      ]),
      h({ alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${t.border}` }, [
        h({ alignItems: "center", gap: 10, fontSize: 17, fontWeight: 600 }, [
          h({ width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, color: "#fff", fontSize: 14, fontWeight: 800 }, "C"),
          "Claude panel",
        ]),
        badge(t, account, color),
      ]),
    ]),
  ]);

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ flex: 1, flexDirection: "column", justifyContent: "center", marginTop: 10 }, [
      label(t, "ONE MAC, TWO ACCOUNTS"),
      h({ justifyContent: "space-between" }, [
        windowMock(t, { alias: "code-personal ~/side-project", dir: "~/.claude-personal", account: "Personal account", color: "green" }),
        windowMock(t, { alias: "code-work ~/day-job", dir: "~/.claude-work", account: "Work account", color: "blue" }),
      ]),
      h({ alignItems: "center", gap: 10, marginTop: 30, fontSize: 18, color: t.muted }, [
        h({ fontWeight: 600, color: t.fg }, "Dock or Spotlight"),
        arrow(t, 32),
        h({}, "LaunchAgent default:"),
        mono({ fontSize: 16, color: t.accent }, "launchctl setenv CLAUDE_CONFIG_DIR ~/.claude-work"),
      ]),
    ]),
  ]);
