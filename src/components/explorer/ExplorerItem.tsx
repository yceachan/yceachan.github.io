/**
 * ExplorerItem — one row (list) or one card (icon) in the explorer
 * (baseline ExplorerItem.vue). Date is YYYY-MM-DD zero-padded.
 */
import { FileText, Folder } from "@appica/icons-react";
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
	const showMarkdownExtension = !isDir && !node.name.toLowerCase().endsWith(".md");
	const displayName = `${node.name}${showMarkdownExtension ? ".md" : ""}`;
	return (
		<button
			type="button"
			className={`explorer-item${mode === "icon" ? " is-icon" : ""}`}
			title={displayName}
			aria-label={`${isDir ? "打开目录" : "打开文档"}: ${displayName}`}
			onClick={() => onSelect(node)}
		>
			<span className="explorer-icon" aria-hidden="true">
				{isDir ? (
					<Folder size={mode === "icon" ? 60 : 19} strokeWidth={1.55} />
				) : (
					<FileText size={mode === "icon" ? 52 : 18} strokeWidth={1.55} />
				)}
			</span>
			<div className="name-container">
				<span className="name">
					{node.name}
					{showMarkdownExtension && (
						<span className="file-extension">.md</span>
					)}
				</span>
				{mode === "list" && node.mtime > 0 && (
					<span className="date">{formatDate(node.mtime)}</span>
				)}
			</div>
		</button>
	);
}
