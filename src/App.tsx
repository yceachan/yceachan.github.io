/**
 * App — public route table.
 *   `/`               Explorer home (?path= drives the directory)
 *   `/:path*`         note pages and the rendered 404 state
 */
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import { profileTitle } from "@/lib/profile";

const NotePage = lazy(() => import("@/components/note/NotePage"));

function DocumentTitle() {
	const { pathname } = useLocation();

	useEffect(() => {
		if (pathname === "/" || pathname === "/index") {
			document.title = profileTitle();
		}
	}, [pathname]);

	return null;
}

function NoteRoute() {
	return (
		<Suspense
			fallback={
				<div className="route-loading" role="status" aria-live="polite">
					<div className="route-loading-line route-loading-title" />
					<div className="route-loading-line" />
					<div className="route-loading-line route-loading-short" />
					<span className="sr-only">正在加载笔记</span>
				</div>
			}
		>
			<NotePage />
		</Suspense>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<DocumentTitle />
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<ExplorerPage />} />
					<Route path="/*" element={<NoteRoute />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
