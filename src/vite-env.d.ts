/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:doc-tree" {
	import type { DocNode } from "@/vite-plugin/docMeta";
	const tree: DocNode[];
	export default tree;
}

declare module "virtual:pwa-register/react" {
	// Provided by vite-plugin-pwa's client types; kept for editor safety.
	export * from "vite-plugin-pwa/react";
}
