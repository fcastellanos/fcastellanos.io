// Header image for "Handing Dependabot to an Agent": Dependabot PRs go through
// the /maintain-dependabot-prs skill and come out merged, rerun or closed.
import { h, brand, canvas, mono, label, dot, row, badge, arrow, glowBox } from "../theme.mjs";

export const post = "2026-10-28-handing-dependabot-to-an-agent";

const prs = [
  ["resend", "Merged", "green"],
  ["rubocop", "Merged + pin", "green"],
  ["selenium-webdriver", "Merged", "green"],
  ["mission_control-jobs", "Rerun", "blue"],
  ["stripe", "Merged", "green"],
  ["json to 3.0", "Closed", "red"],
];

const rule = (t, color, text) =>
  h({ alignItems: "center", gap: 10, fontSize: 18, fontWeight: 500, color: t.fg }, [dot(t[color]), text]);

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 28 }, [
      h({ width: 320, flexDirection: "column" }, [
        label(t, "DEPENDABOT PRS"),
        ...prs.map(([name], i) =>
          row(t, [h({ alignItems: "center", gap: 10 }, [dot(t.green), mono({ fontSize: 17, color: t.fg }, `bump ${name}`)])], i === prs.length - 1 && "red"),
        ),
      ]),
      arrow(t),
      h({ width: 320, flexDirection: "column", alignSelf: "center" }, [
        glowBox(t, {}, [
          h({ fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: t.accent }, "CLAUDE SKILL"),
          mono({ fontSize: 18, color: t.fg }, "/maintain-dependabot-prs"),
          h({ height: 1, backgroundColor: t.border }),
          rule(t, "green", "Merge only when all green"),
          rule(t, "blue", "Rerun failed CI once"),
          rule(t, "red", "Never admin merge"),
        ]),
        h({ marginTop: 18, padding: "10px 14px", borderRadius: 10, backgroundColor: t.pill, justifyContent: "center" }, [
          // Inter, not the mono font: JetBrains Mono turns "~>" into a ligature.
          h({ fontSize: 17, fontWeight: 600, color: t.accent }, 'gem "json", "~> 2.21"'),
        ]),
      ]),
      arrow(t),
      h({ width: 320, flexDirection: "column" }, [
        label(t, "RESULT"),
        ...prs.map(([name, result, color], i) =>
          row(t, [mono({ fontSize: 15, color: t.muted, whiteSpace: "nowrap" }, name), badge(t, result, color)], i === prs.length - 1 && "red"),
        ),
      ]),
    ]),
  ]);
