/**
 * ProfileToggle - three-dot control opening the profile drawer (baseline
 * ProfileToggle.vue). Shown on mobile only.
 */
import { DotsVertical } from "@appica/icons-react";
import { useExplorerStore } from "@/stores/explorer";

export default function ProfileToggle() {
	const mobileDrawer = useExplorerStore((s) => s.mobileDrawer);
	const toggleMobileDrawer = useExplorerStore((s) => s.toggleMobileDrawer);
	const profileOpen = mobileDrawer === "profile";

	return (
		<button
			type="button"
			className="profile-toggle"
			title="个人资料"
			aria-label="个人资料"
			aria-expanded={profileOpen}
			onClick={() => toggleMobileDrawer("profile")}
		>
			<DotsVertical size={18} strokeWidth={1.7} aria-hidden="true" />
		</button>
	);
}
