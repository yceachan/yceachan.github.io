/**
 * PullToRefresh — wraps the app content (baseline PullToRefresh.vue).
 * 80/120 thresholds, 0.5 damping, excluded touch targets, 500ms reload.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

const THRESHOLD = 80;
const MAX_DRAG = 120;

const EXCLUDE_SELECTOR = [
	".kb-sidebar",
	".mobile-sidebar",
	".vault-sidebar",
	".mobile-sidebar-toggle",
	".kb-local-nav",
	".vp-code-group",
	"pre",
	"input",
	"textarea",
	"select",
	"button",
	"a",
].join(", ");

type PtrState = "idle" | "pulling" | "ready" | "refreshing";

export default function PullToRefresh({ children }: { children: ReactNode }) {
	const [pullY, setPullY] = useState(0);
	const [state, setState] = useState<PtrState>("idle");
	const stateRef = useRef<PtrState>("idle");
	const startYRef = useRef(0);
	const pullingRef = useRef(false);

	useEffect(() => {
		const damped = (delta: number) => Math.min(delta * 0.5, MAX_DRAG);

		const onTouchStart = (e: TouchEvent) => {
			if (window.scrollY > 0) return;
			if (stateRef.current === "refreshing") return;
			const target = e.target as Element | null;
			if (target && target.closest && target.closest(EXCLUDE_SELECTOR)) return;
			pullingRef.current = true;
			startYRef.current = e.touches[0].clientY;
		};

		const onTouchMove = (e: TouchEvent) => {
			if (!pullingRef.current || stateRef.current === "refreshing") return;
			const deltaY = e.touches[0].clientY - startYRef.current;
			if (deltaY > 0 && e.cancelable) {
				e.preventDefault();
				const y = damped(deltaY);
				setPullY(y);
				setState(y >= THRESHOLD ? "ready" : "pulling");
			}
		};

		const onTouchEnd = () => {
			if (!pullingRef.current) return;
			pullingRef.current = false;
			if (stateRef.current === "ready") {
				setState("refreshing");
				setPullY(THRESHOLD);
				window.setTimeout(() => window.location.reload(), 500);
			} else {
				setState("idle");
				setPullY(0);
			}
		};

		document.addEventListener("touchstart", onTouchStart, { passive: true });
		document.addEventListener("touchmove", onTouchMove, { passive: false });
		document.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
			document.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	// keep ref in sync
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	return (
		<div className={`ptr-container${state === "idle" ? "" : " ptr-active"}`}>
			<div className="ptr-indicator">
				<svg
					className={`ptr-icon${state === "ready" ? " rotate" : ""}${state === "refreshing" ? " spin" : ""}`}
					viewBox="0 0 24 24"
					width="20"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				>
					<path d="M21 12a9 9 0 1 1-2.64-6.36" />
					<path d="M21 3v6h-6" />
				</svg>
				<span>
					{state === "ready"
						? "释放刷新"
						: state === "refreshing"
							? "正在刷新..."
							: "下拉刷新"}
				</span>
			</div>
			<div
				className="ptr-content"
				style={
					state === "idle"
						? undefined
						: {
								transform: `translateY(${pullY}px)`,
								transition:
									state === "pulling" || state === "ready"
										? "none"
										: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
							}
				}
			>
				{children}
			</div>
		</div>
	);
}
