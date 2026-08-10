/**
 * ExplorerBreadcrumb — home icon + segment trail (baseline
 * ExplorerBreadcrumb.vue). explorer mode: every segment clickable; doc mode:
 * current page non-clickable. >3 segments collapse to ellipsis.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";

export default function ExplorerBreadcrumb({
	context = "doc",
}: {
	context?: "doc" | "explorer";
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const explorerPath = useExplorerStore((s) => s.currentPath);
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);

	const fullPath =
		context === "explorer"
			? explorerPath
			: location.pathname.replace(/\.html$/, "");

	// doc-context on the explorer home page → hidden (baseline suppression)
	if (
		context === "doc" &&
		(location.pathname === "/" || location.pathname === "/index")
	) {
		return null;
	}

	const segments = fullPath
		.split("/")
		.filter(Boolean)
		.map((s) => {
			try {
				return decodeURIComponent(s);
			} catch {
				return s;
			}
		});

	if (segments.length === 0 && context === "doc") return null;

	const visible =
		segments.length <= 3 ? segments : ["…", ...segments.slice(-2)];
	const isCurrent = (i: number) =>
		context !== "explorer" && i === segments.length - 1;

	const go = (path: string) => {
		if (context === "explorer") {
			setCurrentPath(path);
		}
		navigate(path === "/" ? "/" : `/?path=${encodeURIComponent(path)}`);
	};

	let acc = "";

	return (
		<nav className="breadcrumb" aria-label="面包屑">
			<span
				className="crumb-item crumb-home"
				title="回到首页"
				onClick={() => go("/")}
			>
				🏠
			</span>
			{visible.map((seg, i) => {
				if (seg === "…") {
					return (
						<span
							key="ellipsis"
							className="crumb-item ellipsis"
							title={fullPath}
						>
							…
						</span>
					);
				}
				const idx = i === 0 && visible[0] === "…" ? segments.length - 2 : i;
				const prev = acc;
				acc = prev ? `${prev}/${seg}` : seg;
				const segPath = `/${acc}`;
				const isLast = i === visible.length - 1;
				return (
					<span key={segPath} className="crumb-item-group">
						<span className="crumb-separator">/</span>
						{isLast && isCurrent(idx) ? (
							<span className="crumb-item current">{seg}</span>
						) : (
							<span
								className="crumb-item text"
								title={segPath}
								onClick={() => go(segPath)}
							>
								{seg}
							</span>
						)}
					</span>
				);
			})}
		</nav>
	);
}
