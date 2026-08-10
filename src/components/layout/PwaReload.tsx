/**
 * PwaReload — offline-ready / new-version toast (baseline PwaReload.vue).
 * Uses vite-plugin-pwa's React register hook with the baseline prompt flow.
 */
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaReload() {
	const [offlineReady, setOfflineReady] = useState(false);
	const [needRefresh, setNeedRefresh] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	const { updateServiceWorker } = useRegisterSW({
		onRegisteredSW() {},
		onOfflineReady() {
			setOfflineReady(true);
			setDismissed(false);
		},
		onNeedRefresh() {
			setNeedRefresh(true);
			setDismissed(false);
		},
	});

	useEffect(() => {
		if (offlineReady || needRefresh) {
			const t = window.setTimeout(() => {
				// auto-dismiss the offline-ready toast like the baseline (it stays
				// until interaction for needRefresh)
				if (offlineReady) {
					setOfflineReady(false);
				}
			}, 8000);
			return () => window.clearTimeout(t);
		}
	}, [offlineReady, needRefresh]);

	const visible = !dismissed && (offlineReady || needRefresh);
	if (!visible) return null;

	return (
		<div className="pwa-overlay" role="status">
			<div className="pwa-toast">
				<div className="pwa-toast-body">
					<span className="pwa-toast-icon">{needRefresh ? "🚀" : "✅"}</span>
					<div>
						<div className="pwa-toast-title">
							{needRefresh ? "发现新版本" : "已准备就绪"}
						</div>
						<div className="pwa-toast-msg">
							{needRefresh
								? "网站内容已更新，请点击刷新以查看最新版本。"
								: "内容已缓存，现在可以离线访问。"}
						</div>
					</div>
				</div>
				<div className="pwa-toast-actions">
					{needRefresh && (
						<button
							className="pwa-btn primary"
							onClick={() => {
								setDismissed(true);
								updateServiceWorker(true);
							}}
						>
							立即刷新
						</button>
					)}
					<button
						className="pwa-btn"
						onClick={() => {
							setDismissed(true);
							setNeedRefresh(false);
							setOfflineReady(false);
						}}
					>
						稍后
					</button>
				</div>
			</div>
		</div>
	);
}
