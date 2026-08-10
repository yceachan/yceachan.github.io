/**
 * ExplorerItem — one row (list) or one card (icon) in the explorer
 * (baseline ExplorerItem.vue). Date is YYYY-MM-DD zero-padded.
 */
import type { DocNode } from "@/vite-plugin/docMeta";

function formatDate(mtime: number): string {
	const d = new Date(mtime);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ExplorerItem({
	node,
	mode = "list",
	onSelect,
}: {
	node: DocNode;
	mode?: "list" | "icon";
	onSelect: (node: DocNode) => void;
}) {
	const isDir = node.type === "dir";
	return (
		<div
			className={`explorer-item${mode === "icon" ? " is-icon" : ""}`}
			title={node.name}
			onClick={() => onSelect(node)}
		>
			<span className="icon">{isDir ? "📂" : "📄"}</span>
			<div className="name-container">
				<span className="name">{node.name}</span>
				{mode === "list" && node.mtime > 0 && (
					<span className="date">{formatDate(node.mtime)}</span>
				)}
			</div>
		</div>
	);
}
