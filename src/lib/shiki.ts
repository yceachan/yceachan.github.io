/**
 * Shiki highlighter — github-light + github-dark dual themes, CSS-variable
 * driven (same class/structure the VitePress baseline emitted:
 * `<pre class="shiki shiki-themes github-light github-dark vp-code">`).
 *
 * marked's Parser does NOT await async renderers (verified v18), so we warm
 * the highlighter before parsing (renderMarkdown awaits getHighlighter())
 * and call the synchronous `codeToHtml` afterwards.
 */
import { createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

// Languages observed in the actual note corpus (scanned 2026-08-10) plus
// common aliases. Unknown languages fall back to plain blocks, matching the
// baseline (`txt` downgrade / unknown-lang plain behavior).
const LANGS = [
	"c",
	"cpp",
	"bash",
	"rust",
	"makefile",
	"powershell",
	"json",
	"typescript",
	"ini",
	"diff",
	"cmake",
	"css",
	"toml",
	"python",
	"yaml",
	"javascript",
	"tsx",
	"properties",
	"html",
	"vue",
	"qml",
	"markdown",
	"console",
	"batch",
	"plaintext",
];

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ["github-light", "github-dark"],
			langs: LANGS,
		}).then((hl) => {
			highlighter = hl;
			return hl;
		});
	}
	return highlighterPromise;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightSync(code: string, lang: string): string {
	const safeLang = (lang || "").trim().toLowerCase();
	if (highlighter) {
		try {
			const html = highlighter.codeToHtml(code, {
				lang: safeLang || "plaintext",
				themes: { light: "github-light", dark: "github-dark" },
				defaultColor: false,
			});
			// baseline pre carries the `vp-code` class too
			return html.replace(
				'class="shiki shiki-themes github-light github-dark"',
				'class="shiki shiki-themes github-light github-dark vp-code"',
			);
		} catch {
			// unknown language → plain block (baseline txt behavior)
		}
	}
	return `<pre class="shiki vp-code"><code>${escapeHtml(code)}</code></pre>`;
}
