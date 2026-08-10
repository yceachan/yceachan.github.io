/**
 * Explorer store — mirrors the baseline `explorerStore.ts` reactive
 * singleton, with the same localStorage keys (`explorer:sort`).
 */
import { create } from "zustand";

export type SortKey = "name" | "date";
export type SortOrder = "asc" | "desc";

export const SORT_STORAGE_KEY = "explorer:sort";

function loadSort(): { sortKey: SortKey; sortOrder: SortOrder } {
	if (typeof window === "undefined")
		return { sortKey: "name", sortOrder: "asc" };
	const saved = window.localStorage.getItem(SORT_STORAGE_KEY);
	if (saved) {
		const [key, order] = saved.split(":");
		if (key === "name" || key === "date") {
			if (order === "asc" || order === "desc") {
				return { sortKey: key, sortOrder: order };
			}
		}
	}
	return { sortKey: "name", sortOrder: "asc" };
}

interface ExplorerState {
	currentPath: string;
	sortKey: SortKey;
	sortOrder: SortOrder;
	profileOpen: boolean;
	setCurrentPath: (path: string) => void;
	setSort: (sortKey: SortKey, sortOrder: SortOrder) => void;
	setProfileOpen: (open: boolean) => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
	currentPath: "/",
	sortKey: "name",
	sortOrder: "asc",
	profileOpen: false,
	...(typeof window !== "undefined" ? loadSort() : {}),
	setCurrentPath: (currentPath) => set({ currentPath }),
	setSort: (sortKey, sortOrder) => {
		set({ sortKey, sortOrder });
		if (typeof window !== "undefined") {
			window.localStorage.setItem(SORT_STORAGE_KEY, `${sortKey}:${sortOrder}`);
		}
	},
	setProfileOpen: (profileOpen) => set({ profileOpen }),
}));
