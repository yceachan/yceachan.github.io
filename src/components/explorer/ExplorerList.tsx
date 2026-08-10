/**
 * ExplorerList — grid of dirs/files for the current path (baseline
 * ExplorerList.vue). Root → icon card grid; subdirs → list rows.
 */
import { useNavigate } from "react-router-dom";
import { docTree, getCurrentNodes } from "@/lib/tree";
import { useExplorerStore } from "@/stores/explorer";
import ExplorerItem from "./ExplorerItem";
import type { DocNode } from "@/vite-plugin/docMeta";

export default function ExplorerList({ currentPath }: { currentPath: string }) {
	const navigate = useNavigate();
	const sortKey = useExplorerStore((s) => s.sortKey);
	const sortOrder = useExplorerStore((s) => s.sortOrder);
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);

	const nodes = getCurrentNodes(docTree, currentPath, sortKey, sortOrder);
	const isRoot = currentPath === "/" || currentPath === "";

	const onSelect = (node: DocNode) => {
		if (node.type === "dir") {
			// sync store first (baseline: router.onAfterRouteChange occasionally
			// doesn't fire on query-only change)
			setCurrentPath(node.path);
			navigate(`/?path=${encodeURIComponent(node.path)}`);
		} else {
			navigate(node.path);
		}
	};

	if (nodes.length === 0) {
		return <div className="explorer-empty">该目录下没有文件</div>;
	}

	return (
		<div className={`explorer-list${isRoot ? " is-root-grid" : ""}`}>
			{nodes.map((node) => (
				<ExplorerItem
					key={node.path}
					node={node}
					mode={isRoot ? "icon" : "list"}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}
