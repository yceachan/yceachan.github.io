/**
 * ExplorerBreadcrumb — shared trail for the explorer and note pages.
 * The home link and spacing stay identical in both contexts so navigation
 * never changes visual language when a directory becomes a document.
 */
import { ChevronRight, Home } from "@appica/icons-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";

type BreadcrumbProps = {
	context?: "doc" | "explorer";
};

type Crumb = {
	label: string;
	path: string;
};

type VisibleCrumb = Crumb | { kind: "ellipsis"; items: Crumb[] };

function decodeSegment(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function normalisePath(value: string): string {
	const withoutHtml = value.replace(/\.html$/, "");
	if (!withoutHtml || withoutHtml === "/") return "/";
	return `/${withoutHtml.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export default function ExplorerBreadcrumb({
	context = "doc",
}: BreadcrumbProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const explorerPath = useExplorerStore((s) => s.currentPath);
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);

	const fullPath = normalisePath(
		context === "explorer"
			? explorerPath
			: decodeURIComponent(location.pathname.replace(/\.html$/, "")),
	);
	const [ellipsisOpen, setEllipsisOpen] = useState(false);
	const ellipsisRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		setEllipsisOpen(false);
	}, [fullPath]);

	useEffect(() => {
		if (!ellipsisOpen) return;

		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (!ellipsisRef.current?.contains(event.target as Node)) {
				setEllipsisOpen(false);
			}
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setEllipsisOpen(false);
		};

		document.addEventListener("pointerdown", closeOnOutsidePointer);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [ellipsisOpen]);

	// The explorer owns its home trail. The doc-context instance is suppressed
	// on the home route so the home page never receives a duplicate breadcrumb.
	if (
		context === "doc" &&
		(location.pathname === "/" || location.pathname === "/index")
	) {
		return null;
	}

	const segments = fullPath
		.split("/")
		.filter(Boolean)
		.map((label, index, all) => ({
			label: decodeSegment(label),
			path: `/${all.slice(0, index + 1).join("/")}`,
		}));

	const hiddenSegments = segments.slice(0, -2);
	const visible: VisibleCrumb[] =
		segments.length <= 3
			? segments
			: [{ kind: "ellipsis", items: hiddenSegments }, ...segments.slice(-2)];

	const go = (path: string) => {
		setEllipsisOpen(false);
		if (context === "explorer") setCurrentPath(path);
		navigate(path === "/" ? "/" : `/?path=${encodeURIComponent(path)}`);
	};

	return (
		<nav className="breadcrumb" aria-label="面包屑导航">
			<button
				type="button"
				className="crumb-item crumb-home"
				title="回到首页"
				onClick={() => go("/")}
			>
				<Home size={15} strokeWidth={1.75} />
				<span>~</span>
			</button>
			<ChevronRight
				className="crumb-chevron"
				size={14}
				strokeWidth={2.25}
				aria-hidden="true"
			/>

			{visible.length === 0 ? (
				<span className="crumb-item current">Explorer</span>
			) : (
				visible.map((crumb, index) => {
					if ("kind" in crumb) {
						return (
							<span key="ellipsis" className="crumb-ellipsis" ref={ellipsisRef}>
								<button
									type="button"
									className="crumb-item ellipsis"
									title="选择父级目录"
									aria-label="选择父级目录"
									aria-haspopup="menu"
									aria-expanded={ellipsisOpen}
									onClick={() => setEllipsisOpen((open) => !open)}
								>
									…
								</button>
								{ellipsisOpen && (
									<div className="crumb-ellipsis-menu" role="menu" aria-label="父级目录">
										{crumb.items.map((item) => (
											<button
												key={item.path}
												type="button"
												className="crumb-menu-item"
												role="menuitem"
												title={item.path}
												onClick={() => go(item.path)}
											>
												<span>{item.label}</span>
												<small>{item.path}</small>
											</button>
										))}
									</div>
								)}
							</span>
						);
					}

					const isCurrent = context === "doc" && index === visible.length - 1;
					return (
						<span key={crumb.path} className="crumb-item-group">
							<ChevronRight
								className="crumb-chevron"
								size={14}
								strokeWidth={2.25}
								aria-hidden="true"
							/>
							{isCurrent ? (
								<span className="crumb-item current" title={crumb.path}>
									{crumb.label}
								</span>
							) : (
								<button
									type="button"
									className="crumb-item text"
									title={crumb.path}
									onClick={() => go(crumb.path)}
								>
									{crumb.label}
								</button>
							)}
						</span>
					);
				})
			)}
		</nav>
	);
}
