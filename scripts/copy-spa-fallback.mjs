import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve("dist");
await copyFile(resolve(outputDir, "index.html"), resolve(outputDir, "404.html"));
console.log("Copied dist/index.html to dist/404.html for GitHub Pages SPA fallback.");
