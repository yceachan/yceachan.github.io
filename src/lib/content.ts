/**
 * Content map — all notes bundled at build time so the PWA precaches 100%
 * of the knowledge base. Keys are URL paths (`/MPUthings/...`), values are
 * raw markdown source.
 *
 * NOTE: import.meta.glob patterns resolve relative to THIS file (src/lib/),
 * so the content root is `../../docs`.
 */
const contentLoaders = import.meta.glob(
 ["../../docs/**/*.md", "!../../docs/public/**/*.md"],
 { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

const contentKeys = new Map<string, string>();

for (const key of Object.keys(contentLoaders)) {
 const rel = key.replace(/^\.\.\/\.\.\/docs\//, "").replace(/\\/g, "/");
 if (rel.startsWith("public/")) continue;
 contentKeys.set("/" + rel.replace(/\.md$/, ""), key);
}

/**
 * Load one note's markdown source on demand. The note chunks stay out of
 * the entry bundle this way — the main chunk would otherwise inline the
 * whole corpus (5+ MiB) and re-parse it on every page load.
 */
export async function getContent(urlPath: string): Promise<string | undefined> {
 const key = contentKeys.get(urlPath);
 if (!key) return undefined;
 return contentLoaders[key]();
}

export function allContentPaths(): string[] {
 return [...contentKeys.keys()];
}

/**
 * Load every note chunk in parallel (used by full-text search, which needs
 * the whole corpus before it can index). The import cache makes repeat
 * calls free. The PWA precache still bundles these chunks, so they resolve
 * locally even offline.
 */
export async function loadAllContent(): Promise<void> {
 await Promise.all(Object.values(contentLoaders).map((load) => load()));
}
