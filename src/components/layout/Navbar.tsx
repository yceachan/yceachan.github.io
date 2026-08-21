/**
 * Navbar — site title, Back/Home actions, search (K shortcut), dark-mode
 * toggle, GitHub link, mobile hamburger. Baseline NavLeftActions + VitePress
 * navbar behaviors.
 */
import { useEffect, useState } from "react";
import { BrandGithub, Home, Menu, Moon, Sun } from "@appica/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@appica/ui-react/hooks/use-theme";
import { profile } from "@/lib/profile";
import { useExplorerStore } from "@/stores/explorer";
import NavLeftActions from "./NavLeftActions";
import ProfileToggle from "./ProfileToggle";
import SearchBox from "../search/SearchBox";

interface NavbarProps {
	onToggleMobileSidebar: () => void;
}

export default function Navbar({ onToggleMobileSidebar }: NavbarProps) {
	const { resolvedTheme, setTheme, mounted } = useTheme();
	const location = useLocation();
	const navigate = useNavigate();
	const setCurrentPath = useExplorerStore((s) => s.setCurrentPath);
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState("");

	const dark = resolvedTheme === "dark";

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			// VitePress baseline: `K` focuses search (Cmd/Ctrl+K too)
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	useEffect(() => {
		if (location.pathname !== "/") setSearchOpen(false);
	}, [location.pathname]);

	return (
		<header className="kb-navbar">
			<div className="kb-navbar-inner">
				<div className="nav-cluster-left">
					{/* Profile drawer sits left of the hamburger on mobile (the
					   explorer topbar no longer owns it) so both drawers share one
					   consistent nav cluster. */}
					<ProfileToggle />

					<button
						className="nav-hamburger"
						aria-label="打开导航菜单"
						onClick={onToggleMobileSidebar}
					>
						<Menu size={19} strokeWidth={1.75} aria-hidden="true" />
					</button>

					{/* Mobile-only Home: nav-left-actions (Back/Home) is hidden under
					   959px, so the explorer root needs a one-tap escape hatch. */}
					<button
						className="nav-icon-btn nav-home-mobile"
						aria-label="回到首页"
						title="回到首页"
						onClick={() => {
							setCurrentPath("/");
							navigate("/");
						}}
					>
						<Home size={17} strokeWidth={1.75} aria-hidden="true" />
					</button>

					<NavLeftActions />
				</div>

				<Link to="/" className="nav-title nav-title-mobile" title="回到首页">
					EA.KB.IO
				</Link>

				<div className="nav-cluster-right">
					<div className="nav-search">
						<SearchBox
							open={searchOpen}
							onOpenChange={setSearchOpen}
							query={query}
							onQueryChange={setQuery}
						/>
					</div>

					<div className="nav-spacer" />

					{mounted && (
						<button
							className="nav-icon-btn"
							aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
							title={dark ? "切换到浅色模式" : "切换到深色模式"}
							onClick={() => setTheme(dark ? "light" : "dark")}
						>
							{dark ? (
								<Sun size={18} strokeWidth={1.7} aria-hidden="true" />
							) : (
								<Moon size={18} strokeWidth={1.7} aria-hidden="true" />
							)}
						</button>
					)}

					{profile.github && (
						<a
							className="nav-icon-btn"
							href={profile.github}
							target="_blank"
							rel="noreferrer noopener"
							aria-label="GitHub"
							title="GitHub"
						>
							<BrandGithub size={18} strokeWidth={1.7} aria-hidden="true" />
						</a>
					)}
				</div>
			</div>
		</header>
	);
}
