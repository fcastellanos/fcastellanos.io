// Header image for "Asking an AI What to Build Next": a one-line question,
// what Claude read before answering, and where its top three ideas ended up.
import { h, brand, canvas, mono, label, row, badge, arrow, bubble, check } from "../theme.mjs";

export const post = "2026-10-27-asking-ai-what-to-build-next";

const sources = ["db/schema.rb", "config/routes.rb", "app/controllers/", "app/jobs/", "Gemfile", "91 open issues"];

const ideas = [
  ["1", "School-year roll-over", "Filed", "amber"],
  ["2", "CFDI invoicing", "Idea", "muted"],
  ["3", "Audit trail", "Shipped in 9 days", "green"],
];

export const render = (t) =>
  canvas(t, { padding: "48px 64px 64px" }, [
    brand(t, 0.8),
    h({ flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 20 }, [
      h({ width: 300, flexDirection: "column" }, [
        label(t, "THE PROMPT"),
        bubble(t, "What other new features can I add to this school administration project?", { mine: true, style: { fontSize: 22 } }),
      ]),
      arrow(t),
      h({ width: 270, flexDirection: "column" }, [
        label(t, "READ FIRST"),
        ...sources.map((name, i) =>
          row(t, [mono({ fontSize: 16, color: i === sources.length - 1 ? t.accent : t.fg }, name), check(t.green)]),
        ),
      ]),
      arrow(t),
      h({ width: 360, flexDirection: "column" }, [
        label(t, "TOP 3 OF 12 IDEAS"),
        ...ideas.map(([n, name, status, color]) =>
          h(
            {
              flexDirection: "column", gap: 10, padding: "14px 16px", marginBottom: 12, borderRadius: 12,
              backgroundColor: t.surface, border: `1.5px solid ${color === "green" ? t.green : t.border}`,
            },
            [
              h({ alignItems: "center", gap: 12 }, [
                h({ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: t.pill, color: t.accent, fontSize: 16, fontWeight: 800 }, n),
                h({ fontSize: 20, fontWeight: 600 }, name),
              ]),
              h({ paddingLeft: 40 }, [badge(t, status, color)]),
            ],
          ),
        ),
      ]),
    ]),
  ]);
