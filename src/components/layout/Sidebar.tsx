/**
 * Sidebar — doc tree navigation (baseline VitePress sidebar).
 * Renders the profile card on the explorer home page, otherwise the file
 * tree with collapsible folders + bottom copyright. Mobile: off-canvas
 * drawer with overlay, toggled by the navbar hamburger.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, Folder } from "@appica/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { docTree, nameCmp } from "@/lib/tree";
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
				<button
					type="button"
					className="tree-folder-label"
					style={{ paddingLeft: depth * 16 + 8 }}
					onClick={() => setExpanded((v) => !v)}
				>
					<ChevronRight
						className={`tree-chevron${expanded ? " expanded" : ""}`}
						size={14}
						strokeWidth={1.75}
					/>
					<Folder className="tree-node-icon" size={16} strokeWidth={1.65} />
					<span className="tree-text">{node.name}</span>
				</button>
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
	const location = useLocation();
	const navigate = useNavigate();
	const isHome = location.pathname === "/" || location.pathname === "/index";
	const activePath = decodeURIComponent(location.pathname).replace(
		/\.html$/,
		"",
	);

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
		navigate(path);
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

			{/* Mobile layers stay outside the transformed tree drawer. */}
			{isHome ? (
				<div className="mobile-profile-layer">
					<ProfileSidebar />
				</div>
			) : (
				<div className={`mobile-sidebar${mobileOpen ? " is-open" : ""}`}>
					<div className="mobile-sidebar-overlay" onClick={onCloseMobile} />
					<aside className="mobile-sidebar-panel">{treeContent}</aside>
				</div>
			)}
		</>
	);
}
