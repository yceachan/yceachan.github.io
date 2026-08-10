/**
 * ExplorerPage — the home route. Full-page directory browser driven by
 * `?path=` query param (baseline Explorer.vue semantics: query-only changes
 * must re-read the path; store is synced before navigation).
 */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";
import ExplorerTopBar from "./ExplorerTopBar";
import ExplorerList from "./ExplorerList";

export default function ExplorerPage() {
	const [searchParams] = useSearchParams();
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);
	const currentPath = useExplorerStore((s) => s.currentPath);

	// read ?path= (back/forward + query-only navigation)
	useEffect(() => {
		const p = searchParams.get("path");
		setCurrentPath(p || "/");
	}, [searchParams, setCurrentPath]);

	// baseline adds html.is-explorer while mounted
	useEffect(() => {
		document.documentElement.classList.add("is-explorer");
		return () => document.documentElement.classList.remove("is-explorer");
	}, []);

	return (
		<div className="explorer-page">
			<div className="explorer-right">
				<ExplorerTopBar />
				<ExplorerList currentPath={currentPath} />
			</div>
		</div>
	);
}
