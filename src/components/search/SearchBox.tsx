/**
 * SearchBox — navbar search with `K` shortcut, dropdown results
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
			setResults(searchNotes(query, 12));
		} else {
			setResults([]);
		}
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
				className="search-trigger"
				onClick={() => onOpenChange(!open)}
				aria-label="搜索"
				title="搜索 (Ctrl+K)"
			>
				<Search size={16} strokeWidth={1.75} aria-hidden="true" />
				<span className="search-trigger-text">Search</span>
				<kbd className="search-kbd">K</kbd>
			</button>

			{open && (
				<div className="search-panel">
					<input
						ref={inputRef}
						className="search-input"
						placeholder="搜索笔记…"
						value={query}
						onChange={(e) => onQueryChange(e.target.value)}
					/>
					<div className="search-results">
						{query.trim() === "" && (
							<div className="search-empty">输入关键词开始搜索</div>
						)}
						{query.trim() !== "" && results.length === 0 && (
							<div className="search-empty">未找到匹配的笔记</div>
						)}
						{results.map((r) => (
							<button
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
