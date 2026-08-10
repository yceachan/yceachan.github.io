/**
 * Sidebar width + collapse — behavior mirrors the baseline Layout.vue
 * (vp-sidebar-width CSS var on <html>, localStorage keys unchanged).
 */
export const SIDEBAR_STORAGE_KEY = "vp-sidebar-width";
export const SIDEBAR_COLLAPSE_KEY = "vp-sidebar-collapsed";
export const DEFAULT_SIDEBAR_WIDTH = 260;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 600;

export function getSidebarWidth(): number {
	if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
	const cssWidth = getComputedStyle(document.documentElement).getPropertyValue(
		"--vp-sidebar-width",
	);
	const parsed = parseInt(cssWidth, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIDEBAR_WIDTH;
}

export function applySidebarWidth(width: number): void {
	document.documentElement.style.setProperty(
		"--vp-sidebar-width",
		`${width}px`,
	);
}

export function isSidebarCollapsedStored(): boolean {
	if (typeof window === "undefined") return false;
	return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
}

export function restoreSidebarWidth(): void {
	if (typeof window === "undefined") return;
	if (isSidebarCollapsedStored()) {
		applySidebarWidth(0);
		document.body.classList.add("vp-sidebar-collapsed");
		return;
	}
	const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
	const width = saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
	if (Number.isFinite(width) && width > 0) applySidebarWidth(width);
}
