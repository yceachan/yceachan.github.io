import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { docMetaPlugin } from "./src/vite-plugin/docMeta";

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	resolve: {
		alias: {
			"@": new URL("./src", import.meta.url).pathname,
		},
	},
	plugins: [
		react(),
		tailwindcss(),
		docMetaPlugin(),
		VitePWA({
			registerType: "prompt",
			includeAssets: ["profile-photo.svg", "profile-photo.jpg"],
			devOptions: {
				enabled: true,
				type: "module",
				// In dev the plugin generates the SW from dev-dist/, which only
				// holds sw.js + workbox-*.js — both excluded by the default
				// globIgnores — so the workbox globs match nothing and warn.
				// This switches the dev precache to a stub file, silencing it.
				suppressWarnings: true,
			},
			manifest: {
				name: "yceachan's Knowledge Base",
				short_name: "yceachan's Knowledge Base",
				description: "Personal Knowledge Base — React SPA + Appica UI",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				scope: "/",
				start_url: "/",
				id: "/",
				icons: [
					{
						src: "profile-photo-192.jpg",
						sizes: "192x192",
						type: "image/jpeg",
					},
					{
						src: "profile-photo-512.jpg",
						sizes: "512x512",
						type: "image/jpeg",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,json,svg,png,ico,jpg,woff2,woff}"],
				// Notes keep accruing; the bundled content lives inside JS chunks,
				// so 10 MiB leaves the same headroom the VitePress build used.
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
				// SPA: deep links must resolve to index.html offline. The allowlist
				// keeps it from hijacking non-navigation requests.
				navigateFallback: "index.html",
				navigateFallbackAllowlist: [/^\/$/],
				cleanupOutdatedCaches: true,
			},
		}),
	],
	server: {
		port: 5174,
		strictPort: true,
	},
	preview: {
		port: 5174,
		strictPort: true,
	},
});
