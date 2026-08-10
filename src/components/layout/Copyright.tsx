/**
 * Copyright footer (baseline Copyright.vue) — sidebar / doc placements.
 */
import { profile } from "@/lib/profile";

export default function Copyright({
	placement,
}: {
	placement: "sidebar" | "doc";
}) {
	if (!profile.copyright) return null;
	return (
		<div className={`site-copyright ${placement}`}>{profile.copyright}</div>
	);
}
