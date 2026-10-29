// Header image for "PR Looks Good, Merge It": the PR summary and the review
// questions come first, then the five words, then a merge pinned to the
// reviewed commit.
import { h, brand, canvas, mono, label, arrow, bubble, check, badge } from "../theme.mjs";

export const post = "2026-10-27-pr-looks-good-merge-it";

const questions = ["Did it do what we agreed?", "Did it do more than that?", "Could I explain it?", "Does review-pr agree?"];

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 20 }, [
      h({ width: 340, flexDirection: "column" }, [
        label(t, "PR SUMMARY"),
        h({ flexDirection: "column", gap: 14, padding: "20px 20px 22px", borderRadius: 14, backgroundColor: t.surface, border: `1.5px solid ${t.border}` }, [
          h({ alignItems: "center", gap: 10 }, [badge(t, "Open", "green"), h({ fontSize: 18, fontWeight: 700 }, "Scope records to user")]),
          h({ flexDirection: "column", padding: "12px 14px", borderRadius: 10, backgroundColor: `${t.amber}1a`, borderLeft: `4px solid ${t.amber}` }, [
            h({ fontSize: 16, fontWeight: 700, color: t.amber }, "Notably"),
            h({ fontSize: 16, color: t.fg, lineHeight: 1.4 }, "fixing the scoping surfaced a real bug along the way…"),
          ]),
          mono({ fontSize: 15, color: t.muted }, "1616 runs / 0 failures"),
          mono({ fontSize: 15, color: t.muted }, "rubocop clean"),
        ]),
      ]),
      arrow(t),
      h({ width: 300, flexDirection: "column" }, [
        label(t, "MY REVIEW"),
        ...questions.map((q) =>
          h({ alignItems: "center", gap: 12, height: 52, padding: "0 16px", marginBottom: 10, borderRadius: 10, backgroundColor: t.surface, border: `1.5px solid ${t.border}` }, [
            check(t.green),
            h({ fontSize: 17, fontWeight: 500 }, q),
          ]),
        ),
      ]),
      arrow(t),
      h({ width: 330, flexDirection: "column", alignItems: "flex-end" }, [
        label(t, "THEN", { alignSelf: "flex-start" }),
        bubble(t, "PR looks good, merge it", { mine: true, style: { fontSize: 23, fontWeight: 700, whiteSpace: "nowrap" } }),
        h({ flexDirection: "column", gap: 8, marginTop: 22, padding: "14px 16px", borderRadius: 12, backgroundColor: t.pill, alignSelf: "stretch" }, [
          h({ alignItems: "center", gap: 8 }, [check(t.green, 18), h({ fontSize: 15, fontWeight: 600, color: t.green }, "CI green on this commit")]),
          mono({ fontSize: 14, color: t.accent }, "gh pr merge --match-head-commit"),
        ]),
      ]),
    ]),
  ]);
