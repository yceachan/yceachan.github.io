/**
 * TableOfContents — right-rail scroll-spy (baseline VitePress aside outline,
 * level 'deep'). Tracks visible headings via IntersectionObserver.
 */
import { useEffect, useRef, useState } from "react";
import type { RenderResult } from "@/lib/markdown";

export default function TableOfContents({
	headings,
}: {
	headings: RenderResult["headings"];
}) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [visible, setVisible] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		setVisible(headings.length > 0);
		setActiveId(null);
		if (observerRef.current) observerRef.current.disconnect();

		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-72px 0px -60% 0px", threshold: 0 },
		);
		observerRef.current = observer;
		for (const h of headings) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [headings]);

	if (!visible) return null;

	const items = headings.filter((h) => h.depth >= 1 && h.depth <= 4);

	return (
		<aside className="kb-toc" aria-label="本页目录">
			<div className="kb-toc-title">本页目录</div>
			<nav className="kb-toc-nav">
				{items.map((h) => (
					<a
						key={h.id}
						href={`#${h.id}`}
						className={`kb-toc-link depth-${h.depth}${activeId === h.id ? " active" : ""}`}
						onClick={(e) => {
							e.preventDefault();
							document
								.getElementById(h.id)
								?.scrollIntoView({ behavior: "smooth" });
							history.replaceState(null, "", `#${h.id}`);
						}}
					>
						{h.text}
					</a>
				))}
			</nav>
		</aside>
	);
}
