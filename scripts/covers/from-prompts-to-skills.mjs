// Header image for "From Prompts to Skills": the long prompt retyped every
// session becomes "work on 131", backed by the create/check/work skills.
import { h, brand, canvas, mono, label, arrow, glowBox, bubble } from "../theme.mjs";

export const post = "2026-10-24-from-prompts-to-skills";

const prompt =
  "Read issue 124, including the comments. Look at the code it mentions. Tell me your plan before changing anything. " +
  "Then create a branch named after the issue, move the ticket to In progress, implement it, run the tests and RuboCop, " +
  'open a PR that says "Fixes #124", and move the ticket to In review. Don\'t merge.';

const step = (t, name, note, highlight) =>
  h({ flexDirection: "column", alignItems: "center", gap: 6 }, [
    h(
      {
        padding: "10px 16px", borderRadius: 10, backgroundColor: highlight ? t.pill : t.surface,
        border: `1.5px solid ${highlight ? t.accent : t.border}`,
      },
      [mono({ fontSize: 17, color: highlight ? t.accent : t.fg }, name)],
    ),
    h({ fontSize: 14, color: t.muted }, note),
  ]);

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ alignItems: "center", justifyContent: "space-between", marginTop: 34 }, [
      h({ width: 560, flexDirection: "column" }, [
        label(t, "BEFORE: EVERY SESSION"),
        bubble(t, prompt, { mine: true, style: { fontSize: 16, lineHeight: 1.5, opacity: 0.7 } }),
      ]),
      arrow(t, 56),
      h({ width: 400, flexDirection: "column" }, [
        label(t, "AFTER"),
        h({ justifyContent: "flex-end" }, [bubble(t, "work on 131", { mine: true, style: { fontSize: 30, fontWeight: 700, padding: "16px 26px" } })]),
        glowBox(t, { marginTop: 18 }, [
          mono({ fontSize: 16, color: t.muted }, ".claude/skills/"),
          mono({ fontSize: 17, color: t.fg, paddingLeft: 22 }, "create-ticket/SKILL.md"),
          mono({ fontSize: 17, color: t.fg, paddingLeft: 22 }, "check-ticket/SKILL.md"),
          mono({ fontSize: 17, color: t.accent, paddingLeft: 22 }, "work-ticket/SKILL.md"),
        ]),
      ]),
    ]),
    h({ alignItems: "flex-start", justifyContent: "space-between", marginTop: 34 }, [
      step(t, "one sentence", "the idea"),
      arrow(t, 36),
      step(t, "create-ticket", "file it"),
      arrow(t, 36),
      step(t, "check-ticket", "is it real?"),
      arrow(t, 36),
      step(t, "work-ticket", "plan, build, test", true),
      arrow(t, 36),
      step(t, "PR", "In review"),
    ]),
  ]);
