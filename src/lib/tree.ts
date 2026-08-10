/**
 * Doc-tree helpers — behavior mirrors the baseline ExplorerList logic
 * (docs/.vitepress/components/ExplorerList.vue).
 */
import docTree from "virtual:doc-tree";
import type { DocNode } from "@/vite-plugin/docMeta";

export { docTree };

export function findNodeByPath(
	tree: DocNode[],
	path: string,
): DocNode | undefined {
	if (!path || path === "/") return undefined;
	const parts = path.replace(/^\/+|\/+$/g, "").split("/");
	let current: DocNode[] = tree;
	let found: DocNode | undefined;
	for (const part of parts) {
		found = current.find((n) => n.name === part);
		if (!found) return undefined;
		current = found.children ?? [];
	}
	return found;
}

export function nameCmp(a: DocNode, b: DocNode): number {
	const aAscii = a.name.charCodeAt(0) < 0x80;
	const bAscii = b.name.charCodeAt(0) < 0x80;
	if (aAscii !== bAscii) return aAscii ? -1 : 1;
	return a.name.localeCompare(b.name, "zh-Hans-CN");
}

/**
 * Baseline `currentNodes` computed: dirs first, each group sorted by name
 * (or date asc when sortKey=date), desc reverses each group separately.
 */
export function getCurrentNodes(
	tree: DocNode[],
	currentPath: string,
	sortKey: "name" | "date",
	sortOrder: "asc" | "desc",
): DocNode[] {
	const node = findNodeByPath(tree, currentPath);
	const children = node?.children ?? tree;
	const dirs = children.filter((n) => n.type === "dir");
	const files = children.filter((n) => n.type === "file");

	const sortGroup = (group: DocNode[]) => {
		if (sortKey === "date") {
			group.sort((a, b) => a.mtime - b.mtime);
		} else {
			group.sort(nameCmp);
		}
		if (sortOrder === "desc") group.reverse();
		return group;
	};

	return [...sortGroup(dirs), ...sortGroup(files)];
}
