/**
 * Vault store — mirrors the baseline `store.ts` reactive singleton.
 * Token is intentionally NOT persisted (in-memory only, baseline behavior).
 */
import { create } from "zustand";

export interface PrivateFile {
	name: string;
	path: string;
	type: "file" | "dir";
	content?: string;
	children?: PrivateFile[];
	expanded?: boolean;
}

interface VaultState {
	isUnlocked: boolean;
	token: string;
	fileList: PrivateFile[];
	currentDoc: PrivateFile | null;
	setData: (files: PrivateFile[]) => void;
	setCurrentDoc: (file: PrivateFile | null) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
	isUnlocked: false,
	token: "",
	fileList: [],
	currentDoc: null,
	setData: (fileList) => set({ fileList, isUnlocked: true }),
	setCurrentDoc: (currentDoc) => set({ currentDoc }),
}));
