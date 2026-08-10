/**
 * FileTreeNode — recursive vault tree (baseline FileTreeNode.vue).
 * Dir toggle writes back `node.expanded`; indentation (depth*16)+8/24.
 */
import { useEffect, useState } from "react";
import type { PrivateFile } from "@/stores/vault";

export default function FileTreeNode({
	node,
	depth = 0,
	currentPath,
	onSelect,
}: {
	node: PrivateFile;
	depth?: number;
	currentPath?: string;
	onSelect: (node: PrivateFile) => void;
}) {
	const [isExpanded, setIsExpanded] = useState(
		node.expanded !== undefined ? node.expanded : false,
	);

	useEffect(() => {
		if (node.expanded !== undefined) setIsExpanded(node.expanded);
	}, [node.expanded]);

	if (node.type === "dir") {
		return (
			<div className="tree-node">
				<div
					className="tree-folder-label"
					style={{ paddingLeft: (depth || 0) * 16 + 8 }}
					onClick={() => {
						const next = !isExpanded;
						setIsExpanded(next);
						node.expanded = next;
					}}
				>
					<span className={`icon arrow${isExpanded ? " expanded" : ""}`}>
						▶
					</span>
					<span className="icon">📂</span>
					<span className="text">{node.name}</span>
				</div>
				{isExpanded && (
					<div className="tree-children">
						{(node.children || []).map((child) => (
							<FileTreeNode
								key={child.path}
								node={child}
								depth={(depth || 0) + 1}
								currentPath={currentPath}
								onSelect={onSelect}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			className={`tree-item${currentPath === node.path ? " active" : ""}`}
			style={{ paddingLeft: (depth || 0) * 16 + 24 }}
			onClick={() => onSelect(node)}
		>
			<span className="icon">📄</span>
			<span className="text">{node.name}</span>
		</div>
	);
}
