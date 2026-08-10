/**
 * Content map — all notes bundled at build time so the PWA precaches 100%
 * of the knowledge base. Keys are URL paths (`/MPUthings/...`), values are
 * raw markdown source.
 *
 * NOTE: import.meta.glob patterns resolve relative to THIS file (src/lib/),
 * so the content root is `../../docs`.
 */
const rawModules = import.meta.glob(
	[
		"../../docs/**/*.md",
		"!../../docs/public/**/*.md",
		"!../../docs/98-Private/**/*.md",
	],
	{ query: "?raw", import: "default", eager: true },
);

const contentMap: Record<string, string> = {};

for (const [key, value] of Object.entries(rawModules)) {
	const rel = key.replace(/^\.\.\/\.\.\/docs\//, "").replace(/\\/g, "/");
	if (rel.startsWith("public/") || rel.startsWith("98-Private/")) continue;
	const urlPath = "/" + rel.replace(/\.md$/, "");
	contentMap[urlPath] = value as string;
}

export function getContent(urlPath: string): string | undefined {
	return contentMap[urlPath];
}

export function allContentPaths(): string[] {
	return Object.keys(contentMap);
}
