/**
 * App — public route table.
 *   `/`               Explorer home (?path= drives the directory)
 *   `/:path*`         note pages and the rendered 404 state
 */
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import NotePage from "@/components/note/NotePage";
import { profileTitle } from "@/lib/profile";

export default function App() {
	useEffect(() => {
		// Keep the browser tab label owned by the app, rather than inheriting a
		// stale title from the legacy VitePress shell or a cached PWA document.
		const title = profileTitle();
		const enforceTitle = () => {
			if (document.title !== title) document.title = title;
		};
		enforceTitle();

		const titleElement = document.querySelector("title");
		if (!titleElement) return;
		const observer = new MutationObserver(enforceTitle);
		observer.observe(titleElement, {
			childList: true,
			characterData: true,
			subtree: true,
		});
		return () => observer.disconnect();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<ExplorerPage />} />
					<Route path="/*" element={<NotePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
