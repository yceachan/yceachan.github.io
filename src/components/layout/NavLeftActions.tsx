/**
 * NavLeftActions — Back/Home links in the navbar (baseline NavLeftActions.vue).
 * Back is hidden on the same path set; both links navigate with react-router.
 */
import { ArrowBack, Home } from "@appica/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";

const HIDDEN_PATHS = new Set(["/", "/index"]);

function normalizePath(raw: string): string {
	const withoutHtml = raw.replace(/\.html$/, "");
	try {
		return decodeURIComponent(withoutHtml);
	} catch {
		return withoutHtml;
	}
}

export default function NavLeftActions() {
	const location = useLocation();
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);
	// The explorer route owns its directory in the store (ExplorerPage syncs
	// it from ?path=), so the same Back affordance can serve both contexts:
	// note pages derive the trail from the pathname, the explorer from the
	// store — the interaction stays uniform instead of Home-only on /.
	const explorerPath = useExplorerStore((s) => s.currentPath);
	const current = normalizePath(
		location.pathname === "/" ? explorerPath : location.pathname,
	);
	const showBack = !HIDDEN_PATHS.has(current);

	const parentPath = current
		.replace(/^\/+|\/+$/g, "")
		.split("/")
		.filter(Boolean)
		.slice(0, -1)
		.join("/");

	const backHref = parentPath ? `/?path=${encodeURIComponent(parentPath)}` : "/";

	const goBack = () => {
		setCurrentPath(parentPath || "/");
	};

	const goHome = () => {
		setCurrentPath("/");
	};

	return (
		<div className="nav-left-actions">
			{showBack && (
				<Link
					to={backHref}
					onClick={goBack}
					className="nav-left-link"
					title={`返回 Explorer 目录: ${parentPath || "/"}`}
				>
					<ArrowBack size={16} strokeWidth={1.75} aria-hidden="true" />
					<span>Back</span>
				</Link>
			)}
			<Link
				to="/"
				onClick={goHome}
				className="nav-left-link nav-home-link"
				title="回到首页"
			>
				<Home size={16} strokeWidth={1.75} aria-hidden="true" />
				<span>Home</span>
			</Link>
		</div>
	);
}
