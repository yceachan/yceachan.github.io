/**
 * NavLeftActions — Back/Home links in the navbar (baseline NavLeftActions.vue).
 * Back is hidden on the same path set; both links navigate with react-router.
 */
import { Link, useLocation } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";

const HIDDEN_PATHS = new Set([
	"/",
	"/index",
	"/保险箱",
	"/保险箱.html",
	"/library",
	"/library.html",
]);

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
	const currentPath = normalizePath(location.pathname);
	const showBack = !HIDDEN_PATHS.has(currentPath);

	const parentPath = currentPath
		.replace(/^\/+|\/+$/g, "")
		.split("/")
		.filter(Boolean)
		.slice(0, -1)
		.join("/");

	const backHref = parentPath
		? `/?path=${encodeURIComponent(parentPath)}`
		: "/";

	const goBack = () => {
		setCurrentPath(parentPath || "/");
	};

	const goHome = () => {
		setCurrentPath("/");
	};

	return (
		<div
			className="nav-left-actions"
			style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 10 }}
		>
			{showBack && (
				<Link
					to={backHref}
					onClick={goBack}
					className="nav-left-link"
					title={`返回 Explorer 目录: ${parentPath || "/"}`}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M11 5 4 12l7 7" />
						<path d="M4 12h9a7 7 0 0 1 7 7" />
					</svg>
					<span>Back</span>
				</Link>
			)}
			<Link to="/" onClick={goHome} className="nav-left-link" title="回到首页">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="m3 11 9-7 9 7" />
					<path d="M5 10v10h14V10" />
				</svg>
				<span>Home</span>
			</Link>
		</div>
	);
}
