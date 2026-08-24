/**
 * App — public route table.
 *   `/`               Explorer home (?path= drives the directory)
 *   `/:path*`         note pages and the rendered 404 state
 */
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import NotePage from "@/components/note/NotePage";
import { profileTitle } from "@/lib/profile";

function DocumentTitle() {
	const { pathname } = useLocation();

	useEffect(() => {
		if (pathname === "/" || pathname === "/index") {
			document.title = profileTitle();
		}
	}, [pathname]);

	return null;
}

export default function App() {
	return (
		<BrowserRouter>
			<DocumentTitle />
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<ExplorerPage />} />
					<Route path="/*" element={<NotePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
