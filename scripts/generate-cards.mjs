// Generates a branded title card (light and dark, 1200x630 PNG) for every post
// that doesn't set its own `image:` in front matter. The cards are written to
// assets/cards/ before Jekyll builds; _plugins/header_images.rb points each
// post at them. Run with `npm run cards`.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, basename } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { parse } from "yaml";

const root = new URL("..", import.meta.url).pathname;
const outDir = join(root, "assets/cards");
const require = createRequire(import.meta.url);
const font = (weight) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));
const fonts = [500, 600, 800].map((weight) => ({ name: "Inter", data: font(weight), weight, style: "normal" }));

// Same palette as assets/css/main.scss.
const themes = {
  light: { bg: "#fbfbfd", fg: "#16181d", muted: "#5f6672", accent: "#5b4bff", accent2: "#00a3ff", glow: "rgba(91, 75, 255, .16)", pill: "rgba(91, 75, 255, .09)", border: "#e4e6ec" },
  dark: { bg: "#0b0d12", fg: "#e8eaf0", muted: "#9198a6", accent: "#8b7dff", accent2: "#3bc4ff", glow: "rgba(139, 125, 255, .28)", pill: "rgba(139, 125, 255, .16)", border: "#232733" },
};

const h = (style, children) => ({ type: "div", props: { style: { display: "flex", ...style }, children } });

function card({ title, tags, date }, t) {
  const size = title.length <= 40 ? 76 : title.length <= 70 ? 64 : 54;
  return h(
    {
      width: 1200, height: 630, flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 72px",
      fontFamily: "Inter", color: t.fg, backgroundColor: t.bg,
      backgroundImage: `radial-gradient(circle at 88% 8%, ${t.glow}, transparent 55%)`,
    },
    [
      h({ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, backgroundImage: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }),
      h({ alignItems: "center", gap: 18 }, [
        h(
          {
            width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: "#fff", fontSize: 22, fontWeight: 800,
          },
          "FC",
        ),
        h({ fontSize: 28, fontWeight: 600, color: t.muted }, "fcastellanos.io"),
      ]),
      h({ fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", maxWidth: 1030 }, title),
      h({ alignItems: "center", justifyContent: "space-between" }, [
        h({ gap: 12 }, tags.slice(0, 3).map((tag) =>
          h({ padding: "8px 20px", borderRadius: 999, backgroundColor: t.pill, color: t.accent, fontSize: 24, fontWeight: 600 }, tag),
        )),
        h({ fontSize: 24, fontWeight: 500, color: t.muted }, date),
      ]),
    ],
  );
}

function frontMatter(file) {
  const match = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? parse(match[1]) || {} : {};
}

function formatDate(value, name) {
  const raw = value ?? name.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!raw) return "";
  // Front matter dates carry their own offset; format the calendar day as written.
  const day = String(raw instanceof Date ? raw.toISOString() : raw).slice(0, 10);
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

mkdirSync(outDir, { recursive: true });
let count = 0;
for (const dir of ["_posts", "_drafts"]) {
  const path = join(root, dir);
  if (!existsSync(path)) continue;
  for (const name of readdirSync(path).filter((f) => /\.(md|markdown|html)$/.test(f))) {
    const data = frontMatter(join(path, name));
    if (data.image || !data.title) continue;
    const slug = basename(name).replace(/\.[^.]+$/, "");
    const post = { title: String(data.title), tags: [].concat(data.tags ?? []).map(String), date: dir === "_drafts" ? "Draft" : formatDate(data.date, name) };
    for (const [mode, theme] of Object.entries(themes)) {
      const svg = await satori(card(post, theme), { width: 1200, height: 630, fonts });
      writeFileSync(join(outDir, `${slug}-${mode}.png`), new Resvg(svg).render().asPng());
    }
    count++;
  }
}
console.log(`Generated ${count} title cards in assets/cards/`);
