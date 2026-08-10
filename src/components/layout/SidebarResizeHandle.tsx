/**
 * Sidebar resize handle + collapse toggle (baseline Layout.vue).
 * Desktop only (≥960px), hidden on the explorer home page.
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
	SIDEBAR_COLLAPSE_KEY,
	SIDEBAR_STORAGE_KEY,
	DEFAULT_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	MAX_SIDEBAR_WIDTH,
	applySidebarWidth,
	getSidebarWidth,
	isSidebarCollapsedStored,
} from "@/lib/sidebar";

export default function SidebarResizeHandle() {
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [handleLeft, setHandleLeft] = useState(DEFAULT_SIDEBAR_WIDTH);
	const [showHandle, setShowHandle] = useState(false);
	const lastWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
	const isResizingRef = useRef(false);

	const updateHandlePos = () => {
		if (isResizingRef.current) return;
		if (isCollapsed) {
			setHandleLeft(0);
			return;
		}
		setHandleLeft(getSidebarWidth());
	};

	useEffect(() => {
		const checkVisibility = () => {
			const isDesktop = window.matchMedia("(min-width: 960px)").matches;
			const isHomePage =
				location.pathname === "/" || location.pathname === "/index";
			const visible = isDesktop && !isHomePage;
			setShowHandle(visible);
			if (visible) {
				window.setTimeout(updateHandlePos, 100);
			}
		};

		// restore saved state
		const collapsed = isSidebarCollapsedStored();
		setIsCollapsed(collapsed);
		if (collapsed) {
			applySidebarWidth(0);
			document.body.classList.add("vp-sidebar-collapsed");
		} else {
			const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
			const width = saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
			lastWidthRef.current = width;
			applySidebarWidth(width);
		}

		checkVisibility();
		window.addEventListener("resize", updateHandlePos);
		return () => window.removeEventListener("resize", updateHandlePos);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const toggleSidebar = () => {
		const next = !isCollapsed;
		setIsCollapsed(next);
		window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
		if (next) {
			lastWidthRef.current = getSidebarWidth();
			applySidebarWidth(0);
			document.body.classList.add("vp-sidebar-collapsed");
		} else {
			applySidebarWidth(lastWidthRef.current);
			document.body.classList.remove("vp-sidebar-collapsed");
		}
		window.setTimeout(updateHandlePos, 300);
	};

	const initDrag = (e: React.MouseEvent) => {
		if (isCollapsed) return;
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = getSidebarWidth();
		isResizingRef.current = true;
		setIsResizing(true);
		document.body.classList.add("vp-resizing");
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		const onMouseMove = (moveEvent: MouseEvent) => {
			let newWidth = startWidth + (moveEvent.clientX - startX);
			if (newWidth < MIN_SIDEBAR_WIDTH) newWidth = MIN_SIDEBAR_WIDTH;
			if (newWidth > MAX_SIDEBAR_WIDTH) newWidth = MAX_SIDEBAR_WIDTH;
			applySidebarWidth(newWidth);
			setHandleLeft(newWidth);
		};

		const onMouseUp = () => {
			isResizingRef.current = false;
			setIsResizing(false);
			document.body.classList.remove("vp-resizing");
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			window.localStorage.setItem(
				SIDEBAR_STORAGE_KEY,
				String(getSidebarWidth()),
			);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};

	if (!showHandle) return null;

	return (
		<div
			className={`sidebar-resize-handle${isResizing ? " is-resizing" : ""}${isCollapsed ? " is-collapsed" : ""}`}
			style={{ left: handleLeft }}
			onMouseDown={initDrag}
			title="拖拽调整宽度"
		>
			<div className="resize-line"></div>
			<div
				className="collapse-btn"
				onMouseDown={(e) => e.stopPropagation()}
				onClick={toggleSidebar}
				title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
			>
				<span className="icon">{isCollapsed ? "›" : "‹"}</span>
			</div>
		</div>
	);
}
