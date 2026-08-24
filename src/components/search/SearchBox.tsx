/**
 * SearchBox - navbar search with `K` shortcut, dropdown results
 * (baseline VitePress local-search interaction).
 */
import { Search } from "@appica/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchNotes, type SearchHit } from "@/lib/search";

interface SearchBoxProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	query: string;
	onQueryChange: (q: string) => void;
}

export default function SearchBox({
	open,
	onOpenChange,
	query,
	onQueryChange,
}: SearchBoxProps) {
	const [results, setResults] = useState<SearchHit[]>([]);
	const [searching, setSearching] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (open) {
			// focus next frame so the panel is mounted
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	useEffect(() => {
		if (query.trim()) {
			let cancelled = false;
			// First search builds the corpus index (lazy chunks) — show a
			// progress hint instead of silently reporting zero hits.
			setSearching(true);
			searchNotes(query, 12).then((hits) => {
				if (!cancelled) {
					setSearching(false);
					setResults(hits);
				}
			});
			return () => {
				cancelled = true;
			};
		}
		setSearching(false);
		setResults([]);
	}, [query]);

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
				onOpenChange(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onOpenChange(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [onOpenChange]);

	const go = (path: string) => {
		navigate(path);
		onOpenChange(false);
		onQueryChange("");
	};

	return (
		<div className="search-box" ref={boxRef}>
			<button
				type="button"
				className="search-trigger"
				onClick={() => onOpenChange(!open)}
				aria-label="搜索"
				aria-expanded={open}
				aria-controls="kb-search-panel"
				aria-keyshortcuts="Control+K Meta+K"
				title="搜索 (Ctrl/Cmd+K)"
			>
				<Search size={16} strokeWidth={1.75} aria-hidden="true" />
				<span className="search-trigger-text">Search</span>
				<kbd className="search-kbd">K</kbd>
			</button>

			{open && (
				<div
					id="kb-search-panel"
					className="search-panel"
					role="dialog"
					aria-label="搜索笔记"
				>
					<input
						ref={inputRef}
						className="search-input"
						aria-label="搜索笔记"
						placeholder="搜索标题、路径或正文"
						autoComplete="off"
						value={query}
						onChange={(e) => onQueryChange(e.target.value)}
					/>
					<div className="search-results" aria-live="polite">
						{query.trim() === "" && (
							<div className="search-empty">
								<span className="search-empty-text">输入关键词开始搜索</span>
								<small className="search-empty-hint">
									支持标题、路径和正文，按 Esc 关闭
								</small>
							</div>
						)}
						{query.trim() !== "" && results.length === 0 && !searching && (
							<div className="search-empty">未找到匹配的笔记</div>
						)}
						{searching && <div className="search-empty">正在加载索引…</div>}
						{results.map((r) => (
							<button
								type="button"
								key={r.path}
								className="search-result"
								onClick={() => go(r.path)}
							>
								<span className="search-result-title">{r.title}</span>
								<span className="search-result-path">{r.path}</span>
								<span className="search-result-snippet">{r.snippet}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
