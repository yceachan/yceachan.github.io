/**
 * Markdown — renders sanitized marked output, hydrates mermaid, zooms
 * images (medium-zoom), and registers headings for the TOC.
 *
 * The article HTML is applied IMPERATIVELY (not dangerouslySetInnerHTML):
 * mermaid.run() replaces the diagram div's innerHTML with the rendered SVG,
 * and React must never re-apply the original HTML over it.
 */
import { useEffect, useRef } from "react";
import mediumZoom from "medium-zoom";
import mermaid from "mermaid";
import type { RenderResult } from "@/lib/markdown";

mermaid.initialize({
	startOnLoad: false,
	securityLevel: "strict",
	theme: "default",
});

interface MarkdownProps {
	result: RenderResult;
	onHeadings?: (headings: RenderResult["headings"]) => void;
}

export default function Markdown({ result, onHeadings }: MarkdownProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		// pi-lens-ignore: dangerously-set-inner-html
		el.innerHTML = result.html;

		const nodes = [...el.querySelectorAll<HTMLElement>(".mermaid")];
		if (nodes.length > 0) {
			(async () => {
				try {
					await mermaid.run({ nodes });
				} catch (err) {
					console.error("[mermaid] render failed", err);
				}
			})();
		}
	}, [result]);

	// medium-zoom on article images (baseline: `.vp-doc img`), re-init per
	// content change
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const zoom = mediumZoom(el.querySelectorAll("img"), {
			background: "var(--vp-c-bg)",
		});
		return () => {
			zoom.detach();
		};
	}, [result]);

	useEffect(() => {
		onHeadings?.(result.headings);
	}, [result, onHeadings]);

	return <div ref={containerRef} className="vp-doc" />;
}
