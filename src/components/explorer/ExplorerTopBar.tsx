/**
 * ExplorerTopBar — [ProfileToggle] [Breadcrumb] [spacer] [SortControl]
 * (baseline ExplorerTopBar.vue).
 */
import ProfileToggle from "../layout/ProfileToggle";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import SortControl from "./SortControl";

export default function ExplorerTopBar() {
	return (
		<div className="explorer-topbar">
			<ProfileToggle />
			<ExplorerBreadcrumb context="explorer" />
			<div className="topbar-spacer" />
			<SortControl />
		</div>
	);
}
