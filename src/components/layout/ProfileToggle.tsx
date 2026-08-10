/**
 * ProfileToggle — 3-dot hamburger opening the profile drawer (baseline
 * ProfileToggle.vue). Shown on mobile only.
 */
import { useExplorerStore } from "@/stores/explorer";

export default function ProfileToggle() {
	const profileOpen = useExplorerStore((s) => s.profileOpen);
	const setProfileOpen = useExplorerStore((s) => s.setProfileOpen);

	return (
		<button
			className="profile-toggle"
			title="个人资料"
			aria-label="个人资料"
			onClick={() => setProfileOpen(!profileOpen)}
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
				<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
				<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
				<circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
			</svg>
		</button>
	);
}
