/**
 * Navbar — site title, Back/Home actions, search (K shortcut), dark-mode
 * toggle, GitHub link, mobile hamburger. Baseline NavLeftActions + VitePress
 * navbar behaviors.
 */
import { useEffect, useState } from "react";
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
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					>
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				<NavLeftActions />

				<Link to="/" className="nav-title" title="回到首页">
					{profileTitle()}
				</Link>

				<div className="nav-spacer" />

				<div className="nav-search">
					<SearchBox
						open={searchOpen}
						onOpenChange={setSearchOpen}
						query={query}
						onQueryChange={setQuery}
					/>
				</div>

				{mounted && (
					<button
						className="nav-icon-btn"
						aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
						title={dark ? "切换到浅色模式" : "切换到深色模式"}
						onClick={() => setTheme(dark ? "light" : "dark")}
					>
						{dark ? (
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
							</svg>
						) : (
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
							</svg>
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
						<svg
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
						</svg>
					</a>
				)}
			</div>
		</header>
	);
}
