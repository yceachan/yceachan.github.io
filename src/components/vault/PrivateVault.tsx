/**
 * PrivateVault — password unlock → file tree + markdown viewer backed by the
 * Aliyun FC proxy (baseline PrivateVault.vue, behavior parity: in-memory
 * token, ?target= auto-jump, draggable toggle, 150–500px resizer, hljs
 * highlight, frontmatter strip, `*(Loading...)*` / `> ❌ Error loading
 * content` fallbacks).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVaultStore, type PrivateFile } from "@/stores/vault";
import FileTreeNode from "./FileTreeNode";

const API_URL = "https://privatege-proxy-uypbjhvwjb.cn-hongkong.fcapp.run/";

interface ApiFile {
	path: string;
	type: "tree" | "blob";
}

function buildFileTree(flatFiles: ApiFile[]): PrivateFile[] {
	const roots = new Map<string, PrivateFile>();
	const all = new Map<string, PrivateFile>();

	const ensure = (path: string): PrivateFile => {
		const existing = all.get(path);
		if (existing) return existing;
		const name = path.split("/").pop() || path;
		const node: PrivateFile = {
			name,
			path,
			type: path.includes("/") ? "dir" : "file",
		};
		all.set(path, node);
		return node;
	};

	for (const f of flatFiles) {
		const segs = f.path.split("/");
		let acc = "";
		for (let i = 0; i < segs.length; i++) {
			acc = acc ? `${acc}/${segs[i]}` : segs[i];
			ensure(acc);
		}
		const node = all.get(f.path)!;
		node.type = f.type === "tree" ? "dir" : "file";
	}

	for (const f of flatFiles) {
		const segs = f.path.split("/");
		if (segs.length === 1) {
			if (!roots.has(f.path)) roots.set(f.path, all.get(f.path)!);
			continue;
		}
		const parentPath = segs.slice(0, -1).join("/");
		const parent = all.get(parentPath);
		const node = all.get(f.path)!;
		if (parent) {
			parent.children = parent.children || [];
			if (!parent.children.includes(node)) parent.children.push(node);
		} else {
			if (!roots.has(f.path)) roots.set(f.path, node);
		}
	}

	const sortRec = (nodes: PrivateFile[]) => {
		nodes.sort((a, b) => {
			if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
		for (const n of nodes) {
			if (n.children) sortRec(n.children);
		}
	};
	const result = [...roots.values()];
	sortRec(result);
	return result;
}

function findAndExpand(
	files: PrivateFile[],
	target: string,
): PrivateFile | null {
	for (const f of files) {
		if (f.path === target || (f.type === "file" && target.endsWith(f.path))) {
			return f;
		}
		if (f.type === "dir") {
			f.expanded = true;
			const hit = findAndExpand(f.children || [], target);
			if (hit) return hit;
			f.expanded = false;
		}
	}
	return null;
}

export default function PrivateVault() {
	const { isUnlocked, fileList, currentDoc, setCurrentDoc } = useVaultStore();
	const [searchParams] = useSearchParams();
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [unlocking, setUnlocking] = useState(false);
	const [contentLoading, setContentLoading] = useState(false);
	void contentLoading;
	const [docContent, setDocContent] = useState<string | undefined>(undefined);
	const [sidebarWidth, setSidebarWidth] = useState(250);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
		typeof window !== "undefined" ? window.innerWidth < 768 : false,
	);
	const [togglePos, setTogglePos] = useState({ top: 60, left: 16 });
	const pendingAnchorRef = useRef<string | null>(null);

	const target = searchParams.get("target");

	// ---- unlock -------------------------------------------------------------
	const unlock = useCallback(
		async (pw: string) => {
			setUnlocking(true);
			setError("");
			try {
				const res = await fetch(API_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ password: pw, action: "list" }),
				});
				if (!res.ok) throw new Error(`Server Error: ${res.status}`);
				const data = await res.json();
				const realData = data.data || data;
				if (!realData.files) {
					throw new Error("返回数据格式不对，找不到 files 字段");
				}
				const tree = buildFileTree(realData.files);
				useVaultStore.setState({ token: pw, fileList: tree, isUnlocked: true });
				setDocContent(undefined);
				setCurrentDoc(null);
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e));
			} finally {
				setUnlocking(false);
			}
		},
		[setCurrentDoc],
	);

	// ---- ?target= auto-jump after unlock ------------------------------------
	useEffect(() => {
		if (!isUnlocked || !target) return;
		const clean = (() => {
			let t = target;
			const anchorMatch = /#(.+)$/.exec(t);
			if (anchorMatch) {
				pendingAnchorRef.current = anchorMatch[1];
				t = t.slice(0, anchorMatch.index);
			}
			const idx = t.indexOf("98-Private/");
			if (idx >= 0) t = t.slice(idx + "98-Private/".length);
			else t = t.replace(/^(\.\.\/|\.\/)+/, "");
			t = t.replace(/\.html$/, ".md");
			return t;
		})();
		const found = findAndExpand(fileList, clean);
		if (found) selectFile(found);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isUnlocked, target]);

	// ---- open file ----------------------------------------------------------
	const selectFile = useCallback(
		async (file: PrivateFile) => {
			if (file.type === "dir") return;
			setCurrentDoc(file);
			setContentLoading(true);
			setDocContent(undefined);
			try {
				const res = await fetch(API_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						password: useVaultStore.getState().token,
						action: "content",
						path: file.path,
					}),
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);
				const b64 = String(data.content || "").replace(/\s/g, "");
				const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
				const text = new TextDecoder("utf-8").decode(bytes);
				setDocContent(text);
			} catch (e) {
				console.error(e);
				setDocContent("> ❌ Error loading content");
			} finally {
				setContentLoading(false);
			}
		},
		[setCurrentDoc],
	);

	// ---- anchor scroll after content renders --------------------------------
	useEffect(() => {
		if (docContent === undefined || !pendingAnchorRef.current) return;
		const anchor = pendingAnchorRef.current;
		pendingAnchorRef.current = null;
		const t = window.setTimeout(() => {
			try {
				document
					.getElementById(decodeURIComponent(anchor))
					?.scrollIntoView({ behavior: "smooth" });
			} catch {
				/* ignore */
			}
		}, 300);
		return () => window.clearTimeout(t);
	}, [docContent]);

	// ---- sidebar resize (150–500) -------------------------------------------
	const initResize = (e: React.MouseEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = sidebarWidth;
		document.body.classList.add("vp-resizing");
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		const onMove = (me: MouseEvent) => {
			const w = Math.min(
				500,
				Math.max(150, startWidth + (me.clientX - startX)),
			);
			setSidebarWidth(w);
		};
		const onUp = () => {
			document.body.classList.remove("vp-resizing");
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		};
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
	};

	// ---- draggable toggle button (>5px = drag, else click) -------------------
	const dragRef = useRef<{
		startX: number;
		startY: number;
		moved: boolean;
		pos: { top: number; left: number };
	} | null>(null);

	const onToggleDown = (e: React.MouseEvent | React.TouchEvent) => {
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
		dragRef.current = {
			startX: clientX,
			startY: clientY,
			moved: false,
			pos: { ...togglePos },
		};
		if ("touches" in e) e.preventDefault();
	};

	useEffect(() => {
		const onMove = (e: MouseEvent | TouchEvent) => {
			const drag = dragRef.current;
			if (!drag) return;
			const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
			const dx = clientX - drag.startX;
			const dy = clientY - drag.startY;
			if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
				drag.moved = true;
				const top = Math.min(
					window.innerHeight - 40,
					Math.max(0, drag.pos.top + dy),
				);
				const left = Math.min(
					window.innerWidth - 40,
					Math.max(0, drag.pos.left + dx),
				);
				setTogglePos({ top, left });
			}
		};
		const onUp = () => {
			const drag = dragRef.current;
			if (drag && !drag.moved) {
				setIsSidebarCollapsed((v) => !v);
			}
			dragRef.current = null;
		};
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		window.addEventListener("touchmove", onMove, { passive: false });
		window.addEventListener("touchend", onUp);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("touchmove", onMove);
			window.removeEventListener("touchend", onUp);
		};
	}, [togglePos]);

	// ---- render -------------------------------------------------------------
	const renderedContent = (() => {
		if (docContent === undefined) return "*(Loading...)*";
		const stripped = docContent.replace(/^---[\s\S]*?---\n/, "");
		return stripped;
	})();

	return (
		<div className="vault-page">
			{!isUnlocked ? (
				<div className="lock-screen">
					<div className="lock-card">
						<div className="lock-icon">🔐</div>
						<h1>私人保险箱</h1>
						<p>输入密码以访问私人笔记库</p>
						<input
							type="password"
							className="lock-input"
							placeholder="密码"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyUp={(e) => {
								if (e.key === "Enter") unlock(password);
							}}
						/>
						{error && <div className="error-msg">{error}</div>}
						<button
							className="lock-btn"
							disabled={unlocking || !password}
							onClick={() => unlock(password)}
						>
							{unlocking ? "连接中..." : "解锁"}
						</button>
					</div>
				</div>
			) : (
				<div
					className={`vault-ui${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}
				>
					<button
						className="mobile-sidebar-toggle"
						style={{ top: togglePos.top, left: togglePos.left }}
						title="切换文件列表 (可拖动)"
						onMouseDown={onToggleDown}
						onTouchStart={onToggleDown}
					>
						📂
					</button>

					<div
						className="vault-sidebar"
						ref={(el) => {
							if (el)
								el.style.width = isSidebarCollapsed
									? "0px"
									: `${sidebarWidth}px`;
						}}
					>
						<div className="vault-sidebar-header">📦 远程文件库</div>
						<div className="file-tree">
							{fileList.map((root) => (
								<FileTreeNode
									key={root.path}
									node={root}
									currentPath={currentDoc?.path}
									onSelect={(n) => selectFile(n)}
								/>
							))}
						</div>
					</div>

					{!isSidebarCollapsed && (
						<div className="vault-resizer" onMouseDown={initResize} />
					)}

					<div className="vault-content">
						{currentDoc ? (
							<div className="vp-doc">
								<h2 className="vault-doc-title">{currentDoc.name}</h2>
								// pi-lens-ignore: dangerously-set-inner-html
								<div dangerouslySetInnerHTML={{ __html: renderedContent }} />
							</div>
						) : (
							<div className="empty-state">
								<div>👋 已安全连接</div>
								<p>从左侧选择文件以从 GitHub 私有仓库加载内容</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
