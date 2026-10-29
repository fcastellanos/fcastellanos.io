// Renders the hand-designed header images in scripts/covers/ (one module per
// post) to assets/img/<post>/cover-{light,dark}.png. Unlike the title cards,
// these are committed: run `npm run covers` after adding or changing one, then
// point the post at it with `image:` and `image_dark:` in its front matter.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { fonts, themes } from "./theme.mjs";

const root = new URL("..", import.meta.url).pathname;
const coversDir = join(root, "scripts/covers");

for (const file of readdirSync(coversDir).filter((f) => f.endsWith(".mjs"))) {
  const { post, render } = await import(join(coversDir, file));
  const slug = post.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const outDir = join(root, "assets/img", slug);
  mkdirSync(outDir, { recursive: true });
  for (const [mode, theme] of Object.entries(themes)) {
    const svg = await satori(render(theme), { width: 1200, height: 630, fonts });
    writeFileSync(join(outDir, `cover-${mode}.png`), new Resvg(svg).render().asPng());
  }
  console.log(`Rendered assets/img/${slug}/cover-{light,dark}.png`);
}
