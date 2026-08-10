/**
 * SortControl — name/date select + asc/desc toggle (baseline SortControl.vue).
 * Persists to `explorer:sort` via the store.
 */
import { useExplorerStore } from "@/stores/explorer";

export default function SortControl() {
	const sortKey = useExplorerStore((s) => s.sortKey);
	const sortOrder = useExplorerStore((s) => s.sortOrder);
	const setSort = useExplorerStore((s) => s.setSort);

	return (
		<div className="sort-control">
			<select
				className="sort-select"
				value={sortKey}
				onChange={(e) => setSort(e.target.value as "name" | "date", sortOrder)}
				title="排序方式"
				aria-label="排序方式"
			>
				<option value="name">名称</option>
				<option value="date">日期</option>
			</select>
			<button
				className="sort-order"
				title={sortOrder === "asc" ? "降序" : "升序"}
				aria-label={sortOrder === "asc" ? "切换为降序" : "切换为升序"}
				onClick={() => setSort(sortKey, sortOrder === "asc" ? "desc" : "asc")}
			>
				{sortOrder === "asc" ? "↑" : "↓"}
			</button>
		</div>
	);
}
