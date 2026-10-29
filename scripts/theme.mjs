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

// Building blocks for the diagrams in scripts/covers/.
export const mono = (style, text) => h({ fontFamily: "JetBrains Mono", fontWeight: 500, ...style }, text);

export const label = (t, text, style) =>
  h({ fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: t.muted, marginBottom: 14, ...style }, text);

export const dot = (color, size = 12) => h({ width: size, height: size, borderRadius: 999, backgroundColor: color, flexShrink: 0 });

export const row = (t, children, highlight) =>
  h(
    {
      alignItems: "center", justifyContent: "space-between", gap: 10, height: 46, padding: "0 14px", marginBottom: 10,
      backgroundColor: t.surface, borderRadius: 10, border: `1.5px solid ${highlight ? t[highlight] : t.border}`,
    },
    children,
  );

export const badge = (t, text, color) =>
  h({ flexShrink: 0, whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 999, backgroundColor: color === "muted" ? t.pill : `${t[color]}22`, color: color === "muted" ? t.muted : t[color], fontSize: 15, fontWeight: 600 }, text);

const svg = (markup, width, height) => ({
  type: "img",
  props: { src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${markup}</svg>`)}`, width, height },
});

export const arrow = (t, length = 44) =>
  h({ width: length + 12, justifyContent: "center", alignSelf: "center", flexShrink: 0 }, [
    svg(`<path d="M2 10h${length - 6}M${length - 14} 3l8 7-8 7" fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, length, 20),
  ]);

export const check = (color, size = 20) =>
  svg(`<circle cx="10" cy="10" r="10" fill="${color}" opacity=".18"/><path d="M5.5 10.5l3 3 6-7" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`, size, size);

// A gradient-bordered box, used for the agent/skill in the middle of a diagram.
export const glowBox = (t, style, children) =>
  h({ padding: 2, borderRadius: 18, backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, ...style }, [
    h({ flex: 1, flexDirection: "column", gap: 14, padding: "22px 22px 24px", borderRadius: 16, backgroundColor: t.surface }, children),
  ]);

// A chat bubble; `mine` uses the accent gradient like a sent message.
export const bubble = (t, text, { mine = false, style = {} } = {}) =>
  h(
    {
      padding: "16px 20px", borderRadius: 18, fontSize: 20, fontWeight: 500, lineHeight: 1.4,
      ...(mine
        ? { backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: "#fff", borderBottomRightRadius: 4 }
        : { backgroundColor: t.surface, border: `1.5px solid ${t.border}`, color: t.fg, borderBottomLeftRadius: 4 }),
      ...style,
    },
    text,
  );
