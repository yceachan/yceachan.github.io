/**
 * App — route table (baseline URL semantics preserved).
 *   `/`               Explorer home (?path= drives the directory)
 *   `/:path*`         note pages (excluding reserved routes)
 *   `/保险箱`          PrivateVault
 *   `/library`        LibraryControl
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import NotePage from "@/components/note/NotePage";
import PrivateVault from "@/components/vault/PrivateVault";
import LibraryPage from "@/components/library/LibraryPage";

const RESERVED = new Set(["保险箱", "library", "index"]);

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<ExplorerPage />} />
					<Route path="/保险箱" element={<PrivateVault />} />
					<Route path="/library" element={<LibraryPage />} />
					<Route
						path="/*"
						element={
							<ReservedGuard>
								<NotePage />
							</ReservedGuard>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

function ReservedGuard({ children }: { children: React.ReactNode }) {
	const first = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
	if (RESERVED.has(decodeURIComponent(first))) {
		return <Navigate to="/" replace />;
	}
	return children;
}
