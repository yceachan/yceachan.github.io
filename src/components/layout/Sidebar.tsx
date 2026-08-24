/**
 * Sidebar — doc tree navigation (baseline VitePress sidebar).
 * Renders the profile card on the explorer home page, otherwise the file
 * tree with collapsible folders + bottom copyright. Mobile: off-canvas
 * drawer with overlay, toggled by the navbar hamburger.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, Folder } from "@appica/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { docTree, findNodeByPath, nameCmp } from "@/lib/tree";
import { useExplorerStore } from "@/stores/explorer";
import type { DocNode } from "@/vite-plugin/docMeta";
import Copyright from "./Copyright";
import ProfileSidebar from "./ProfileSidebar";

interface SidebarProps {
	mobileOpen: boolean;
	onCloseMobile: () => void;
}

function TreeItem({
	node,
	depth,
	activePath,
	onNavigate,
}: {
	node: DocNode;
	depth: number;
	activePath: string;
	onNavigate: (path: string) => void;
}) {
	// Ancestor dirs of the active file open automatically (baseline behavior);
	// manual toggles win until the route changes again.
	const forceOpen =
		activePath !== node.path &&
		node.path !== "/" &&
		activePath.startsWith(node.path + "/");
	const [expanded, setExpanded] = useState(forceOpen);

	useEffect(() => {
		if (forceOpen) setExpanded(true);
	}, [forceOpen]);

	if (node.type === "dir") {
		const children = node.children ?? [];
		return (
			<div className="tree-node">
				<div
					className={`tree-folder-label${activePath === node.path ? " active" : ""}`}
					style={{ paddingLeft: depth * 16 + 8 }}
				>
					<button
						type="button"
						className="tree-folder-toggle"
						aria-label={`${expanded ? "收起" : "展开"}目录: ${node.name}`}
						aria-expanded={expanded}
						title={expanded ? "收起目录" : "展开目录"}
						onClick={() => setExpanded((v) => !v)}
					>
						<ChevronRight
							className={`tree-chevron${expanded ? " expanded" : ""}`}
							size={14}
							strokeWidth={1.75}
						/>
					</button>
					<button
						type="button"
						className="tree-folder-link"
						aria-label={`打开目录: ${node.name}`}
						title={`在 Explorer 中打开 ${node.name}`}
						onClick={() => onNavigate(node.path)}
					>
						<Folder className="tree-node-icon" size={16} strokeWidth={1.65} />
						<span className="tree-text">{node.name}</span>
					</button>
				</div>
				{expanded && (
					<div className="tree-children">
						{children.map((c) => (
							<TreeItem
								key={c.path}
								node={c}
								depth={depth + 1}
								activePath={activePath}
								onNavigate={onNavigate}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<button
			type="button"
			className={`tree-item${activePath === node.path ? " active" : ""}`}
			style={{ paddingLeft: depth * 16 + 24 }}
			onClick={() => onNavigate(node.path)}
		>
			<FileText className="tree-node-icon" size={15} strokeWidth={1.65} />
			<span className="tree-text">{node.name}</span>
		</button>
	);
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
	const mobileDrawer = useExplorerStore((s) => s.mobileDrawer);
	const location = useLocation();
	const navigate = useNavigate();
	const isHome = location.pathname === "/" || location.pathname === "/index";
	const explorerPath = new URLSearchParams(location.search).get("path");
	const activePath = decodeURIComponent(
		isHome && explorerPath ? explorerPath : location.pathname,
	).replace(/\.html$/, "");

	const sortedTree = useMemo(() => {
		const sortDeep = (nodes: DocNode[]): DocNode[] => {
			const dirs = nodes.filter((n) => n.type === "dir").sort(nameCmp);
			const files = nodes.filter((n) => n.type === "file").sort(nameCmp);
			return [
				...dirs.map((d) => ({
					...d,
					children: d.children ? sortDeep(d.children) : undefined,
				})),
				...files,
			];
		};
		return sortDeep(docTree);
	}, []);

	const onNavigate = (path: string) => {
		const node = findNodeByPath(sortedTree, path);
		navigate(node?.type === "dir" ? `/?path=${encodeURIComponent(path)}` : path);
		onCloseMobile();
	};

	const treeContent = (
		<>
			<div className="sidebar-tree">
				{sortedTree.map((node) => (
					<TreeItem
						key={node.path}
						node={node}
						depth={0}
						activePath={activePath}
						onNavigate={onNavigate}
					/>
				))}
			</div>
			<Copyright placement="sidebar" />
		</>
	);

	return (
		<>
			{/* Desktop sidebar */}
			<aside className="kb-sidebar">
				{isHome ? <ProfileSidebar /> : treeContent}
			</aside>

			{/* The mobile file tree is available from both notes and Explorer. */}
			<div
				className={`mobile-sidebar${mobileOpen ? " is-open" : ""}`}
				aria-hidden={!mobileOpen}
				inert={!mobileOpen}
			>
				<button
					type="button"
					className="mobile-sidebar-overlay"
					aria-label="关闭导航菜单"
					onClick={onCloseMobile}
				/>
				<aside
					id="mobile-sidebar-panel"
					className="mobile-sidebar-panel"
					aria-label="移动端文件树"
					aria-hidden={!mobileOpen}
				>
					{treeContent}
				</aside>
			</div>
			{/* The navbar ProfileToggle is visible on every page, so the drawer
			   layer must mount unconditionally on mobile; the desktop rail keeps
			   its home-only profile card above. */}
			<div
				className="mobile-profile-layer"
				aria-hidden={mobileDrawer !== "profile"}
				inert={mobileDrawer !== "profile"}
			>
				<ProfileSidebar />
			</div>
		</>
	);
}
