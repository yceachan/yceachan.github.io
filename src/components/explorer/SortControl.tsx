/**
 * SortControl - name/date menu + asc/desc toggle (baseline SortControl.vue).
 * Persists to `explorer:sort` via the store.
 */
import { useEffect, useRef, useState } from "react";
import { useExplorerStore } from "@/stores/explorer";
import {
	Check,
	ChevronDown,
	SortAscending,
	SortDescending,
} from "@appica/icons-react";

const SORT_OPTIONS = [
	{ value: "name", label: "名称" },
	{ value: "date", label: "日期" },
] as const;

export default function SortControl() {
	const sortKey = useExplorerStore((s) => s.sortKey);
	const sortOrder = useExplorerStore((s) => s.sortOrder);
	const setSort = useExplorerStore((s) => s.setSort);
	const [open, setOpen] = useState(false);
	const controlRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
	}, [open]);

	const focusOption = (index: number) => {
		const options = menuRef.current?.querySelectorAll<HTMLButtonElement>(
			"[data-sort-option]",
		);
		if (!options?.length) return;
		options[(index + options.length) % options.length].focus();
	};

	const openMenu = () => {
		setOpen(true);
		requestAnimationFrame(() => {
			focusOption(SORT_OPTIONS.findIndex((option) => option.value === sortKey));
		});
	};

	const chooseSort = (value: "name" | "date") => {
		setSort(value, sortOrder);
		setOpen(false);
		requestAnimationFrame(() => triggerRef.current?.focus());
	};

	return (
		<div className="sort-control" ref={controlRef}>
			<button
				type="button"
				ref={triggerRef}
				className="sort-key-trigger"
				title="排序方式"
				aria-label="排序方式"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => (open ? setOpen(false) : openMenu())}
				onKeyDown={(event) => {
					if (event.key === "ArrowDown" || event.key === "ArrowUp") {
						event.preventDefault();
						openMenu();
					}
				}}
			>
				<span>{SORT_OPTIONS.find((option) => option.value === sortKey)?.label}</span>
				<ChevronDown
					className={`sort-chevron${open ? " is-open" : ""}`}
					size={14}
					strokeWidth={1.8}
					aria-hidden="true"
				/>
			</button>

			{open && (
				<div
					ref={menuRef}
					className="sort-menu"
					role="menu"
					aria-label="排序方式"
					onKeyDown={(event) => {
						const options = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(
							"[data-sort-option]",
						)];
						const current = options.indexOf(document.activeElement as HTMLButtonElement);
						if (event.key === "Escape") {
							event.preventDefault();
							setOpen(false);
							triggerRef.current?.focus();
						} else if (event.key === "ArrowDown") {
							event.preventDefault();
							focusOption(current + 1);
						} else if (event.key === "ArrowUp") {
							event.preventDefault();
							focusOption(current - 1);
						} else if (event.key === "Home") {
							event.preventDefault();
							focusOption(0);
						} else if (event.key === "End") {
							event.preventDefault();
							focusOption(options.length - 1);
						}
					}}
				>
					{SORT_OPTIONS.map((option) => {
						const selected = option.value === sortKey;
						return (
							<button
								key={option.value}
								type="button"
								className="sort-menu-item"
								role="menuitemradio"
								aria-checked={selected}
								data-sort-option
								onClick={() => chooseSort(option.value)}
							>
								<span>{option.label}</span>
								<span className="sort-check" aria-hidden="true">
									{selected && <Check size={14} strokeWidth={2} />}
								</span>
							</button>
						);
					})}
				</div>
			)}

			<button
				type="button"
				className="sort-order"
				title={sortOrder === "asc" ? "降序" : "升序"}
				aria-label={sortOrder === "asc" ? "切换为降序" : "切换为升序"}
				onClick={() => setSort(sortKey, sortOrder === "asc" ? "desc" : "asc")}
			>
				{sortOrder === "asc" ? (
					<SortAscending size={16} strokeWidth={1.7} aria-hidden="true" />
				) : (
					<SortDescending size={16} strokeWidth={1.7} aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
