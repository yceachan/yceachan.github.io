/**
 * Navbar — site title, Back/Home actions, search (K shortcut), dark-mode
 * toggle, GitHub link, mobile hamburger. Baseline NavLeftActions + VitePress
 * navbar behaviors.
 */
import { useEffect, useState } from "react";
import { BrandGithub, Menu, Moon, Sun } from "@appica/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@appica/ui-react/hooks/use-theme";
import { profile, profileTitle } from "@/lib/profile";
import NavLeftActions from "./NavLeftActions";
import SearchBox from "../search/SearchBox";

interface NavbarProps {
	onToggleMobileSidebar: () => void;
}

export default function Navbar({ onToggleMobileSidebar }: NavbarProps) {
	const { resolvedTheme, setTheme, mounted } = useTheme();
	const location = useLocation();
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
				<button
					className="nav-hamburger"
					aria-label="打开导航菜单"
					onClick={onToggleMobileSidebar}
				>
					<Menu size={19} strokeWidth={1.75} aria-hidden="true" />
				</button>

				<NavLeftActions />

				<Link to="/" className="nav-title nav-title-mobile" title="回到首页">
					{profileTitle()}
				</Link>

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
		</header>
	);
}
