/**
 * ExplorerTopBar — [Breadcrumb] [spacer] [SortControl]
 * (baseline ExplorerTopBar.vue; ProfileToggle moved to the navbar).
 */
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import SortControl from "./SortControl";

export default function ExplorerTopBar() {
	return (
		<div className="explorer-topbar">
			<ExplorerBreadcrumb context="explorer" />
			<div className="topbar-spacer" />
			<SortControl />
		</div>
	);
}
