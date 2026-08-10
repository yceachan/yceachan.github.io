/**
 * AppShell — navbar + sidebar + content frame with the baseline
 * `--vp-sidebar-width` CSS-variable layout, resize handle and PWA toast.
 */
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarResizeHandle from "./SidebarResizeHandle";
import PwaReload from "./PwaReload";
import PullToRefresh from "./PullToRefresh";
import { restoreSidebarWidth } from "@/lib/sidebar";
import { profileTitle } from "@/lib/profile";

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
				<aside className="kb-rail">
					<div className="kb-rail-header">
						<Link to="/" className="rail-title" title="回到首页">
							{profileTitle()}
						</Link>
					</div>
					<div className="kb-sidebar-slot">
						<Sidebar
							mobileOpen={mobileOpen}
							onCloseMobile={() => setMobileOpen(false)}
						/>
						<SidebarResizeHandle />
					</div>
				</aside>
				<div className="kb-workspace">
					<Navbar onToggleMobileSidebar={() => setMobileOpen((v) => !v)} />
					<div className="kb-body">
						<main className="kb-main">
							<Outlet />
						</main>
					</div>
				</div>
			</div>
		</PullToRefresh>
	);
}
