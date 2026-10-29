// Header image for "Handing Dependabot to an Agent": Dependabot PRs go through
// the /maintain-dependabot-prs skill and come out merged, rerun or closed.
import { h, brand, canvas } from "../theme.mjs";

export const post = "2026-10-28-handing-dependabot-to-an-agent";

const prs = [
  ["resend", "Merged", "green"],
  ["rubocop", "Merged + pin", "green"],
  ["selenium-webdriver", "Merged", "green"],
  ["mission_control-jobs", "Rerun", "blue"],
  ["stripe", "Merged", "green"],
  ["json to 3.0", "Closed", "red"],
];

const label = (t, text) =>
  h({ fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: t.muted, marginBottom: 14 }, text);

const row = (t, children, highlight) =>
  h(
    {
      alignItems: "center", justifyContent: "space-between", gap: 10, height: 46, padding: "0 14px", marginBottom: 10,
      backgroundColor: t.surface, borderRadius: 10, border: `1.5px solid ${highlight ? t.red : t.border}`,
    },
    children,
  );

const mono = (style, text) => h({ fontFamily: "JetBrains Mono", fontWeight: 500, ...style }, text);

const dot = (color) => h({ width: 12, height: 12, borderRadius: 999, backgroundColor: color, flexShrink: 0 });

const badge = (t, text, color) =>
  h({ flexShrink: 0, whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 999, backgroundColor: `${t[color]}22`, color: t[color], fontSize: 15, fontWeight: 600 }, text);

const arrow = (t) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="20" viewBox="0 0 44 20"><path d="M2 10h36M30 3l8 7-8 7" fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return h({ width: 56, justifyContent: "center", alignSelf: "center" }, [
    { type: "img", props: { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width: 44, height: 20 } },
  ]);
};

const rule = (t, color, text) =>
  h({ alignItems: "center", gap: 10, fontSize: 18, fontWeight: 500, color: t.fg }, [dot(t[color]), text]);

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 28 }, [
      h({ width: 320, flexDirection: "column" }, [
        label(t, "DEPENDABOT PRS"),
        ...prs.map(([name], i) =>
          row(t, [h({ alignItems: "center", gap: 10 }, [dot(t.green), mono({ fontSize: 17, color: t.fg }, `bump ${name}`)])], i === prs.length - 1),
        ),
      ]),
      arrow(t),
      h({ width: 320, flexDirection: "column", alignSelf: "center" }, [
        h({ padding: 2, borderRadius: 18, backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }, [
          h({ flex: 1, flexDirection: "column", gap: 14, padding: "22px 22px 24px", borderRadius: 16, backgroundColor: t.surface }, [
            h({ fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: t.accent }, "CLAUDE SKILL"),
            mono({ fontSize: 18, color: t.fg }, "/maintain-dependabot-prs"),
            h({ height: 1, backgroundColor: t.border }),
            rule(t, "green", "Merge only when all green"),
            rule(t, "blue", "Rerun failed CI once"),
            rule(t, "red", "Never admin merge"),
          ]),
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
          row(t, [mono({ fontSize: 15, color: t.muted, whiteSpace: "nowrap" }, name), badge(t, result, color)], i === prs.length - 1),
        ),
      ]),
    ]),
  ]);
