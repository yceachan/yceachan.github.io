import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import type { Plugin } from "vite";

export interface DocNode {
	name: string;
	path: string;
	rawName: string;
	type: "file" | "dir";
	mtime: number;
	children?: DocNode[];
}

function getGitMtime(filePath: string): number {
	try {
		const stdout = execSync(`git log -1 --format=%ct -- "${filePath}"`, {
			encoding: "utf-8",
			stdio: "pipe",
		});
		if (stdout.trim()) {
			return parseInt(stdout.trim(), 10) * 1000;
		}
	} catch (e) {
		// Ignore error and fallback to fs.stat
	}
	return fs.statSync(filePath).mtimeMs;
}

function walk(
	dir: string,
	baseDir: string,
	excludePatterns: RegExp[],
): DocNode[] {
	if (!fs.existsSync(dir)) return [];
	const items = fs.readdirSync(dir);
	const nodes: DocNode[] = [];

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

		if (excludePatterns.some((p) => p.test(item) || p.test(relativePath))) {
			continue;
		}

		const stat = fs.statSync(fullPath);
		const isDir = stat.isDirectory();

		if (isDir) {
			const children = walk(fullPath, baseDir, excludePatterns);
			if (children.length > 0) {
				nodes.push({
					name: item,
					path: "/" + relativePath,
					rawName: item,
					type: "dir",
					mtime: Math.max(...children.map((c) => c.mtime), 0),
					children,
				});
			}
		} else if (item.endsWith(".md")) {
			const baseName = item.replace(/\.md$/, "");
			nodes.push({
				name: baseName,
				path: "/" + relativePath.replace(/\.md$/, ""),
				rawName: item,
				type: "file",
				mtime: getGitMtime(fullPath),
			});
		}
	}
	return nodes;
}

/**
 * Build-time doc tree + mtimes. Mirrors the legacy `docTreePlugin`
 * (docs/.vitepress/plugins/docTreePlugin.ts) so Explorer sorting by date
 * keeps working with bundled content.
 */
export function docMetaPlugin(): Plugin {
	const virtualModuleId = "virtual:doc-tree";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "doc-tree",
		resolveId(id) {
			if (id === virtualModuleId) return resolvedVirtualModuleId;
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				const docsDir = path.resolve(import.meta.dirname, "../../docs");
				const excludePatterns = [/^\./, /^public$/, /(^|\/)index\.md$/];
				const tree = walk(docsDir, docsDir, excludePatterns);
				return `export default ${JSON.stringify(tree)}`;
			}
		},
	};
}
