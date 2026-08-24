/**
 * ProfileSidebar — profile card / mobile drawer (baseline ProfileSidebar.vue
 * + SidebarProfileWrapper.vue). Contact-link derivation rules are identical.
 */
import { useMemo } from "react";
import {
	ArrowUpRight,
	BrandGithub,
	Mail,
	UserPlus,
} from "@appica/icons-react";
import { profile } from "@/lib/profile";
import { useExplorerStore } from "@/stores/explorer";

type ContactLink = {
	kind: "email" | "github" | "repo" | "friend";
	value: string;
	href: string;
	external: boolean;
};

const getDisplayNameFromUrl = (url: string, fallback: string) => {
	try {
		const pathname = new URL(url).pathname.replace(/\/+$/, "");
		const segments = pathname.split("/").filter(Boolean);
		return segments.at(-1) || fallback;
	} catch {
		return fallback;
	}
};

const toMailto = (email: string) =>
	email.startsWith("mailto:") ? email : `mailto:${email}`;

export default function ProfileSidebar() {
	const mobileDrawer = useExplorerStore((s) => s.mobileDrawer);
	const closeMobileDrawer = useExplorerStore((s) => s.closeMobileDrawer);
	const profileOpen = mobileDrawer === "profile";

	const photo = profile.photo || profile.jpg;

	const contactLinks = useMemo<ContactLink[]>(() => {
		const links: ContactLink[] = [];
		if (profile.mail || profile.email) {
			const mail = (profile.mail || profile.email) as string;
			links.push({
				kind: "email",
				value: mail,
				href: toMailto(mail),
				external: false,
			});
		}
		if (profile.github) {
			const githubName =
				profile.name || getDisplayNameFromUrl(profile.github, "user");
			links.push({
				kind: "github",
				value: `github/${githubName}`,
				href: profile.github,
				external: true,
			});
		}
		if (profile.repo) {
			links.push({
				kind: "repo",
				value: getDisplayNameFromUrl(profile.repo, "Repo"),
				href: profile.repo,
				external: true,
			});
		}
		for (const friend of profile.friends || []) {
			if (!friend) continue;
			links.push({
				kind: "friend",
				// baseline ProfileSidebar.vue uses getDisplayNameFromUrl (last
				// URL path segment), not the github username derivation
				value: getDisplayNameFromUrl(friend, "Repo"),
				href: friend,
				external: true,
			});
		}
		return links;
	}, []);

	return (
		<div className={`profile-sidebar${profileOpen ? " is-open" : ""}`}>
			{profileOpen && (
				<button
					type="button"
					className="profile-overlay"
					aria-label="关闭个人资料"
					onClick={closeMobileDrawer}
				/>
			)}
			<div className="profile-content">
				<div className="profile-header">
					{photo && (
						<img src={photo} alt={profile.name || "头像"} className="avatar" />
					)}
					<h2 className="profile-name">{profile.name}</h2>
					<p className="profile-bio">{profile.bio}</p>
				</div>
				<div className="profile-links">
					{contactLinks.map((item) => (
						<a
							key={item.value}
							href={item.href}
							className="link-item"
							target={item.external ? "_blank" : undefined}
							rel={item.external ? "noreferrer noopener" : undefined}
						>
							<span className="link-icon" aria-hidden="true">
								{item.kind === "email" ? (
									<Mail size={18} strokeWidth={1.7} />
								) : item.kind === "github" ? (
									<BrandGithub size={18} strokeWidth={1.7} />
								) : item.kind === "friend" ? (
									<UserPlus size={18} strokeWidth={1.7} />
								) : (
									<ArrowUpRight size={18} strokeWidth={1.7} />
								)}
							</span>
							<span className="link-value">{item.value}</span>
						</a>
					))}
				</div>
				{profile.copyright && (
					<div className="profile-copyright">{profile.copyright}</div>
				)}
			</div>
		</div>
	);
}
