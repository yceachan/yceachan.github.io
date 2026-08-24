/**
 * Sidebar resize handle + collapse toggle (baseline Layout.vue).
 * Desktop only (≥960px); also shown on the explorer home page so the
 * profile sidebar is drag-resizable there too.
 */
import {
	useEffect,
	useRef,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "@appica/icons-react";
import {
	SIDEBAR_COLLAPSE_KEY,
	SIDEBAR_STORAGE_KEY,
	DEFAULT_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	MAX_SIDEBAR_WIDTH,
	applySidebarWidth,
	getSidebarWidth,
	isSidebarCollapsedStored,
	restoreSidebarWidth,
} from "@/lib/sidebar";

const KEYBOARD_STEP = 16;

function clampWidth(width: number): number {
	return Math.min(Math.max(width, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
}

export default function SidebarResizeHandle() {
	const [isCollapsed, setIsCollapsed] = useState(isSidebarCollapsedStored);
	const [isResizing, setIsResizing] = useState(false);
	const [handleLeft, setHandleLeft] = useState(DEFAULT_SIDEBAR_WIDTH);
	const [isDesktop, setIsDesktop] = useState(false);
	const lastWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
	const isResizingRef = useRef(false);

	useEffect(() => {
		const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
		const parsed = saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
		if (Number.isFinite(parsed) && parsed >= MIN_SIDEBAR_WIDTH) {
			lastWidthRef.current = Math.min(parsed, MAX_SIDEBAR_WIDTH);
		}
		restoreSidebarWidth();

		const media = window.matchMedia("(min-width: 960px)");
		const syncDesktop = () => setIsDesktop(media.matches);
		syncDesktop();
		media.addEventListener("change", syncDesktop);
		return () => media.removeEventListener("change", syncDesktop);
	}, []);

	useEffect(() => {
		if (!isDesktop || isResizingRef.current) return;
		setHandleLeft(isCollapsed ? 0 : getSidebarWidth());
	}, [isCollapsed, isDesktop]);

	const setExpandedWidth = (width: number) => {
		const nextWidth = clampWidth(width);
		lastWidthRef.current = nextWidth;
		applySidebarWidth(nextWidth);
		setHandleLeft(nextWidth);
		window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextWidth));
	};

	const expandSidebar = (width = lastWidthRef.current) => {
		setIsCollapsed(false);
		window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "false");
		document.body.classList.remove("kb-sidebar-collapsed");
		setExpandedWidth(width);
	};

	const toggleSidebar = () => {
		if (isCollapsed) {
			expandSidebar();
			return;
		}

		lastWidthRef.current = Math.max(getSidebarWidth(), MIN_SIDEBAR_WIDTH);
		setIsCollapsed(true);
		window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "true");
		applySidebarWidth(0);
		document.body.classList.add("kb-sidebar-collapsed");
		setHandleLeft(0);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		// The collapse button is a nested control. Let it keep its own keyboard
		// behavior instead of treating its arrow keys as resize commands.
		if (event.target !== event.currentTarget) return;

		if (isCollapsed) {
			if (event.key === "ArrowRight") {
				event.preventDefault();
				expandSidebar();
			}
			return;
		}

		const currentWidth = getSidebarWidth();
		let nextWidth: number | null = null;
		switch (event.key) {
			case "ArrowLeft":
				nextWidth = currentWidth - KEYBOARD_STEP;
				break;
			case "ArrowRight":
				nextWidth = currentWidth + KEYBOARD_STEP;
				break;
			case "Home":
				nextWidth = MIN_SIDEBAR_WIDTH;
				break;
			case "End":
				nextWidth = MAX_SIDEBAR_WIDTH;
				break;
			default:
				return;
		}

		event.preventDefault();
		setExpandedWidth(nextWidth);
	};

	const initDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
		if (isCollapsed) return;
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = getSidebarWidth();
		isResizingRef.current = true;
		setIsResizing(true);
		document.body.classList.add("kb-is-resizing");
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

			const onMouseMove = (moveEvent: WindowEventMap["mousemove"]) => {
			const newWidth = clampWidth(startWidth + (moveEvent.clientX - startX));
			applySidebarWidth(newWidth);
			lastWidthRef.current = newWidth;
			setHandleLeft(newWidth);
		};

		const onMouseUp = () => {
			isResizingRef.current = false;
			setIsResizing(false);
			document.body.classList.remove("kb-is-resizing");
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

	if (!isDesktop) return null;

	return (
		<div
			role="separator"
			aria-label="调整侧栏宽度"
			aria-orientation="vertical"
			tabIndex={0}
			aria-valuemin={isCollapsed ? 0 : MIN_SIDEBAR_WIDTH}
			aria-valuemax={MAX_SIDEBAR_WIDTH}
			aria-valuenow={isCollapsed ? 0 : handleLeft}
			aria-valuetext={isCollapsed ? "侧栏已收起" : `${handleLeft}px`}
			className={`sidebar-resize-handle${isResizing ? " is-resizing" : ""}${isCollapsed ? " is-collapsed" : ""}`}
			style={{ left: handleLeft }}
			onMouseDown={initDrag}
			onKeyDown={handleKeyDown}
			title="拖拽或使用方向键调整宽度"
		>
			<div className="resize-line"></div>
			<button
				type="button"
				className="collapse-btn"
				onMouseDown={(e) => e.stopPropagation()}
				onClick={toggleSidebar}
				aria-label={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
				title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
			>
				{isCollapsed ? (
					<ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
				) : (
					<ChevronLeft size={15} strokeWidth={1.8} aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
