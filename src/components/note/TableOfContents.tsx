/**
 * TableOfContents — desktop right-rail scroll-spy plus a mobile edge tab.
 * On small screens the tab opens the same outline in a light drawer so the
 * article keeps its reading width without losing navigation.
 */
import { useEffect, useRef, useState } from "react";
import { List, X } from "@appica/icons-react";
import type { RenderResult } from "@/lib/markdown";

type TocItem = RenderResult["headings"][number];

function TocLinks({
	items,
	activeId,
	onSelect,
}: {
	items: TocItem[];
	activeId: string | null;
	onSelect: (id: string) => void;
}) {
	return (
		<nav className="kb-toc-nav" aria-label="文章标题">
			{items.map((heading) => (
				<button
					type="button"
					key={heading.id}
					className={`kb-toc-link depth-${heading.depth}${activeId === heading.id ? " active" : ""}`}
					aria-current={activeId === heading.id ? "location" : undefined}
					onClick={() => onSelect(heading.id)}
				>
					{heading.text}
				</button>
			))}
		</nav>
	);
}

export default function TableOfContents({
	headings,
}: {
	headings: RenderResult["headings"];
}) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const items = headings.filter(
		(heading) => heading.depth >= 1 && heading.depth <= 4,
	);

	useEffect(() => {
		setActiveId(null);
		setMobileOpen(false);
		observerRef.current?.disconnect();

		if (items.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActiveId(entry.target.id);
				}
			},
			{ rootMargin: "-72px 0px -60% 0px", threshold: 0 },
		);
		observerRef.current = observer;

		for (const heading of items) {
			const element = document.getElementById(heading.id);
			if (element) observer.observe(element);
		}

		return () => observer.disconnect();
	}, [headings, items.length]);

	if (items.length === 0) return null;

	const selectHeading = (id: string) => {
		document.getElementById(id)?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
		history.replaceState(null, "", `#${id}`);
		setMobileOpen(false);
	};

	return (
		<>
			<aside className="kb-toc" aria-label="本页目录">
				<div className="kb-toc-title">本页目录</div>
				<TocLinks items={items} activeId={activeId} onSelect={selectHeading} />
			</aside>

			<button
				type="button"
				className="kb-toc-fab"
				aria-label="打开本页目录"
				aria-expanded={mobileOpen}
				title="本页目录"
				onClick={() => setMobileOpen((open) => !open)}
			>
				<List size={18} strokeWidth={1.7} aria-hidden="true" />
			</button>

			{mobileOpen && (
				<button
					type="button"
					className="kb-toc-mobile-overlay"
					aria-label="关闭本页目录"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			<aside
				className={`kb-toc-mobile${mobileOpen ? " is-open" : ""}`}
				aria-label="本页目录"
				aria-hidden={!mobileOpen}
			>
				<div className="kb-toc-mobile-header">
					<div className="kb-toc-title">本页目录</div>
					<button
						type="button"
						className="kb-toc-mobile-close"
						aria-label="关闭本页目录"
						onClick={() => setMobileOpen(false)}
					>
						<X size={18} strokeWidth={1.7} aria-hidden="true" />
					</button>
				</div>
				<TocLinks items={items} activeId={activeId} onSelect={selectHeading} />
			</aside>
		</>
	);
}
