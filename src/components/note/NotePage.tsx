/**
 * NotePage — breadcrumb + frontmatter + markdown + TOC + doc footer
 * (baseline doc page: ExplorerBreadcrumb, FrontmatterBlock, vp-doc,
 * VPDocAsideOutline, Copyright doc placement).
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getContent } from "@/lib/content";
import { renderMarkdown, type RenderResult } from "@/lib/markdown";
import ExplorerBreadcrumb from "../explorer/ExplorerBreadcrumb";
import FrontmatterBlock from "./FrontmatterBlock";
import Markdown from "./Markdown";
import TableOfContents from "./TableOfContents";
import Copyright from "../layout/Copyright";

export default function NotePage() {
	const params = useParams();
	const location = useLocation();
	const [result, setResult] = useState<RenderResult | null>(null);
	const [notFound, setNotFound] = useState(false);

	const path = useMemo(() => {
		const wild = params["*"] ?? "";
		return "/" + wild.replace(/\.html$/, "");
	}, [params]);

	const src = useMemo(() => getContent(path), [path]);

	useEffect(() => {
		let cancelled = false;
		setResult(null);
		setNotFound(false);
		if (src === undefined) {
			setNotFound(true);
			return;
		}
		renderMarkdown(src).then((r) => {
			if (!cancelled) setResult(r);
		});
		return () => {
			cancelled = true;
		};
	}, [src, path]);

	useEffect(() => {
		// scroll to top on note navigation (baseline VitePress behavior)
		if (location.key !== "default") {
			window.scrollTo({ top: 0 });
		}
	}, [path, location.key]);

	if (notFound) {
		return (
			<div className="note-page">
				<div className="note-main">
					<ExplorerBreadcrumb />
					<div className="note-404">
						<h1>页面不存在</h1>
						<p>
							笔记 <code>{path}</code> 不在本知识库中。
						</p>
						<Link to="/" className="note-404-home">
							返回 Explorer
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="note-page">
				<div className="note-main">
					<ExplorerBreadcrumb />
					<div className="note-loading">加载中…</div>
				</div>
			</div>
		);
	}

	return (
		<div className="note-page">
			<div className="note-main">
				<ExplorerBreadcrumb />
				<FrontmatterBlock src={src ?? ""} />
				<article className="note-article">
					<Markdown result={result} />
				</article>
				<Copyright placement="doc" />
			</div>
			<TableOfContents headings={result.headings} />
		</div>
	);
}
