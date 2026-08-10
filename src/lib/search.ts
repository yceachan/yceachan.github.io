/**
 * Client-side full-text search over the bundled corpus (build-time content),
 * MiniSearch — same engine family the VitePress baseline local search used.
 */
import MiniSearch from "minisearch";
import { allContentPaths, getContent } from "./content";
import { splitFrontmatter } from "./markdown";

export interface SearchHit {
	path: string;
	title: string;
	snippet: string;
}

let miniSearch: MiniSearch<{ id: string; title: string; text: string }> | null =
	null;

function stripMd(src: string): string {
	return src
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1 ")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1 ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1 ")
		.replace(/[#>*_~\-|]/g, " ");
}

function buildIndex() {
	const docs: { id: string; title: string; text: string }[] = [];
	for (const path of allContentPaths()) {
		if (path === "/index") continue;
		const src = getContent(path) ?? "";
		const { frontmatter, body } = splitFrontmatter(src);
		const titleMatch = /^#\s+(.+)$/m.exec(body);
		const title =
			titleMatch?.[1].trim() ?? path.split("/").filter(Boolean).at(-1) ?? path;
		const head = frontmatter ?? "";
		docs.push({
			id: path,
			title,
			text: `${title}\n${head}\n${stripMd(body)}`,
		});
	}
	miniSearch = new MiniSearch({
		fields: ["title", "text"],
		storeFields: ["title"],
		searchOptions: {
			boost: { title: 4 },
			prefix: true,
			fuzzy: 0.2,
		},
	});
	miniSearch.addAll(docs);
}

export function searchNotes(query: string, limit = 20): SearchHit[] {
	if (!miniSearch) buildIndex();
	if (!query.trim()) return [];
	const results = miniSearch!
		.search(query, { boost: { title: 4 }, prefix: true, fuzzy: 0.2 })
		.slice(0, limit);
	return results.map((r) => {
		const src = getContent(r.id) ?? "";
		const { body } = splitFrontmatter(src);
		const plain = stripMd(body).replace(/\s+/g, " ").trim();
		const idx = plain.toLowerCase().indexOf(query.toLowerCase());
		const start = Math.max(0, idx - 40);
		const snippet =
			idx >= 0
				? (start > 0 ? "…" : "") + plain.slice(start, start + 120) + "…"
				: plain.slice(0, 120);
		return {
			path: r.id,
			title: (r as unknown as { title?: string }).title ?? r.id,
			snippet,
		};
	});
}
