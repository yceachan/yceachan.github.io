/**
 * ProfileSidebar — profile card / mobile drawer (baseline ProfileSidebar.vue
 * + SidebarProfileWrapper.vue). Contact-link derivation rules are identical.
 */
import { useMemo } from "react";
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
	const profileOpen = useExplorerStore((s) => s.profileOpen);
	const setProfileOpen = useExplorerStore((s) => s.setProfileOpen);

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

	const close = () => setProfileOpen(false);

	return (
		<div className={`profile-sidebar${profileOpen ? " is-open" : ""}`}>
			{profileOpen && <div className="profile-overlay" onClick={close} />}
			<div className="profile-content">
				<div className="profile-header">
					{photo && <img src={photo} alt="Avatar" className="avatar" />}
					<h2 className="name">{profile.name}</h2>
					<p className="bio">{profile.bio}</p>
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
									<svg className="email-mark" viewBox="0 0 24 24" fill="none">
										<path d="M4 6h16v12H4z" />
										<path d="m4 7 8 6 8-6" />
									</svg>
								) : item.kind === "github" ? (
									<svg
										className="github-mark"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
									</svg>
								) : item.kind === "friend" ? (
									<svg viewBox="0 0 24 24" fill="none">
										<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
										<circle cx="8.5" cy="7" r="4" />
										<path d="M20 8v6" />
										<path d="M23 11h-6" />
									</svg>
								) : (
									<svg viewBox="0 0 24 24" fill="none">
										<path d="M3 12h15.5" />
										<path d="m13.5 6 7 6-7 6" />
									</svg>
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
