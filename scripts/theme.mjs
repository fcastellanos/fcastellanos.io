// Shared palette, fonts and element helper for the generated header images.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const woff = (pkg, name, weight) => readFileSync(require.resolve(`${pkg}/files/${name}-latin-${weight}-normal.woff`));

export const fonts = [
  ...[500, 600, 800].map((weight) => ({ name: "Inter", data: woff("@fontsource/inter", "inter", weight), weight, style: "normal" })),
  ...[500].map((weight) => ({ name: "JetBrains Mono", data: woff("@fontsource/jetbrains-mono", "jetbrains-mono", weight), weight, style: "normal" })),
];

// Same palette as assets/css/main.scss, plus status colors for diagrams.
export const themes = {
  light: {
    bg: "#fbfbfd", surface: "#ffffff", fg: "#16181d", muted: "#5f6672", accent: "#5b4bff", accent2: "#00a3ff",
    glow: "rgba(91, 75, 255, .16)", pill: "rgba(91, 75, 255, .09)", border: "#e4e6ec",
    green: "#1a7f37", amber: "#9a6700", blue: "#0969da", red: "#cf222e",
  },
  dark: {
    bg: "#0b0d12", surface: "#12151c", fg: "#e8eaf0", muted: "#9198a6", accent: "#8b7dff", accent2: "#3bc4ff",
    glow: "rgba(139, 125, 255, .28)", pill: "rgba(139, 125, 255, .16)", border: "#232733",
    green: "#3fb950", amber: "#d29922", blue: "#58a6ff", red: "#f85149",
  },
};

export const h = (style, children) => ({ type: "div", props: { style: { display: "flex", ...style }, children } });

// The FC logo and site name shown in the top-left of every header image.
export const brand = (t, scale = 1) =>
  h({ alignItems: "center", gap: 18 * scale }, [
    h(
      {
        width: 56 * scale, height: 56 * scale, borderRadius: 14 * scale, alignItems: "center", justifyContent: "center",
        backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: "#fff", fontSize: 22 * scale, fontWeight: 800,
      },
      "FC",
    ),
    h({ fontSize: 28 * scale, fontWeight: 600, color: t.muted }, "fcastellanos.io"),
  ]);

// 1200x630 canvas with the site background, corner glow and gradient bottom bar.
export const canvas = (t, style, children) =>
  h(
    {
      position: "relative", width: 1200, height: 630, flexDirection: "column", fontFamily: "Inter", color: t.fg,
      backgroundColor: t.bg, backgroundImage: `radial-gradient(circle at 88% 8%, ${t.glow}, transparent 55%)`, ...style,
    },
    [
      ...children,
      h({ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, backgroundImage: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }),
    ],
  );
