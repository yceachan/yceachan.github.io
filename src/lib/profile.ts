/**
 * Profile — bundled from docs/public/profile.json (the tracked source of
 * truth shared with the legacy VitePress app and KB_GIT sync rules).
 * A copy also lives at public/profile.json for any runtime fetchers.
 */
import profileJson from "../../docs/public/profile.json";

export interface Profile {
	photo?: string;
	name?: string;
	bio?: string;
	mail?: string;
	email?: string;
	github?: string;
	repo?: string;
	friends?: string[];
	copyright?: string;
	jpg?: string;
}

export const profile = (profileJson ?? {}) as Profile;

export function profileTitle(): string {
	return `${profile.name || "KB"}'s Knowledge Base`;
}
