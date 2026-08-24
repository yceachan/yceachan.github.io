/**
 * AppShell - navbar, sidebar, content frame, resize handle and PWA toast.
 */
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useExplorerStore } from "@/stores/explorer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarResizeHandle from "./SidebarResizeHandle";
import PwaReload from "./PwaReload";
import PullToRefresh from "./PullToRefresh";
import { profileTitle } from "@/lib/profile";

export default function AppShell() {
	const mobileDrawer = useExplorerStore((s) => s.mobileDrawer);
	const closeMobileDrawer = useExplorerStore((s) => s.closeMobileDrawer);
	const toggleMobileDrawer = useExplorerStore((s) => s.toggleMobileDrawer);
	const location = useLocation();

	useEffect(() => {
		closeMobileDrawer();
	}, [location.pathname, closeMobileDrawer]);

	useEffect(() => {
		const onResize = () => {
			if (window.innerWidth >= 960 && mobileDrawer !== null) {
				closeMobileDrawer();
			}
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [closeMobileDrawer, mobileDrawer]);

	useEffect(() => {
		if (mobileDrawer === null) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMobileDrawer();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [closeMobileDrawer, mobileDrawer]);

	return (
		<PullToRefresh>
			<PwaReload />
			<div className="kb-app">
				<aside className="kb-rail">
					<div className="kb-rail-header">
						<Link to="/" className="rail-title" title="回到首页">
							{profileTitle()}
						</Link>
					</div>
					<Sidebar
						mobileOpen={mobileDrawer === "sidebar"}
						onCloseMobile={closeMobileDrawer}
					/>
					<SidebarResizeHandle />
				</aside>
				<div className="kb-workspace">
					<Navbar onToggleMobileSidebar={() => toggleMobileDrawer("sidebar")} />
					<main className="kb-main">
						<Outlet />
					</main>
				</div>
			</div>
		</PullToRefresh>
	);
}
