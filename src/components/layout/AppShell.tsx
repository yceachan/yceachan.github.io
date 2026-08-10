/**
 * AppShell — navbar + sidebar + content frame with the baseline
 * `--vp-sidebar-width` CSS-variable layout, resize handle and PWA toast.
 */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarResizeHandle from "./SidebarResizeHandle";
import PwaReload from "./PwaReload";
import PullToRefresh from "./PullToRefresh";
import { restoreSidebarWidth } from "@/lib/sidebar";
import { useLocation } from "react-router-dom";

export default function AppShell() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		restoreSidebarWidth();
		// close the mobile drawer on navigation
		setMobileOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		const onResize = () => {
			if (window.innerWidth >= 960) setMobileOpen(false);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return (
		<PullToRefresh>
			<PwaReload />
			<div className="kb-app">
				<Navbar onToggleMobileSidebar={() => setMobileOpen((v) => !v)} />
				<div className="kb-body">
					<div className="kb-sidebar-slot">
						<Sidebar
							mobileOpen={mobileOpen}
							onCloseMobile={() => setMobileOpen(false)}
						/>
						<SidebarResizeHandle />
					</div>
					<main className="kb-main">
						<Outlet />
					</main>
				</div>
			</div>
		</PullToRefresh>
	);
}
