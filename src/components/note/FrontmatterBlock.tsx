/**
 * FrontmatterBlock — YAML frontmatter preview above the doc (baseline
 * FrontmatterBlock.vue). HIDE_KEYS and serialization rules are identical.
 */
import { useMemo } from "react";
import { splitFrontmatter } from "@/lib/markdown";

const HIDE_KEYS = new Set([
	"layout",
	"outline",
	"lastUpdated",
	"editLink",
	"navbar",
	"sidebar",
	"aside",
	"pageClass",
	"head",
	"titleTemplate",
]);

type YamlNode =
	| string
	| number
	| boolean
	| null
	| YamlNode[]
	| { [k: string]: YamlNode };

function parseScalar(raw: string): YamlNode {
	const s = raw.trim();
	if (s === "" || s === "~" || s === "null") return null;
	if (s === "true") return true;
	if (s === "false") return false;
	if (/^-?\d+$/.test(s)) return parseInt(s, 10);
	if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
	if (s.startsWith("[") && s.endsWith("]")) {
		return s
			.slice(1, -1)
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean)
			.map((x) => parseScalar(x));
	}
	const quoted = /^(['"])(.*)\1$/.exec(s);
	return quoted ? quoted[2] : s;
}

/** Minimal indentation-based YAML-subset parser (enough for note frontmatter). */
function parseBlock(
	lines: string[],
	start: number,
	indent: number,
): { node: YamlNode; next: number } {
	const obj: { [k: string]: YamlNode } = {};
	let i = start;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim() || line.trim().startsWith("#")) {
			i++;
			continue;
		}
		const indentMatch = /^(\s*)(.*)$/.exec(line)!;
		const curIndent = indentMatch[1].length;
		if (curIndent < indent) break;
		const content = indentMatch[2];

		// array item (`- x` or `- key: v`)
		if (content.startsWith("- ")) {
			const arr: YamlNode[] = [];
			while (i < lines.length) {
				const lm = /^(\s*)- ?(.*)$/.exec(lines[i]);
				if (!lm || lm[1].length !== curIndent) break;
				const itemContent = lm[2];
				const km = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(itemContent);
				if (km && km[2] === "") {
					const { node, next } = parseBlock(lines, i + 1, curIndent + 2);
					arr.push(node);
					i = next;
					continue;
				}
				arr.push(parseScalar(itemContent));
				i++;
			}
			// attach under a synthetic key — arrays at top level are rare; merge
			// into the previous key if it was a `key:` with no value
			const prevKeys = Object.keys(obj);
			if (prevKeys.length > 0) {
				const lastKey = prevKeys[prevKeys.length - 1];
				if (obj[lastKey] === null) obj[lastKey] = arr;
				else obj[`-${curIndent}-${i}`] = arr;
			} else {
				return { node: arr, next: i };
			}
			continue;
		}

		const km = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(content);
		if (!km) {
			i++;
			continue;
		}
		const key = km[1];
		const rest = km[2];
		if (rest === "") {
			const { node, next } = parseBlock(lines, i + 1, curIndent + 2);
			if (next > i + 1) {
				obj[key] = node;
				i = next;
				continue;
			}
			obj[key] = null;
		} else {
			obj[key] = parseScalar(rest);
		}
		i++;
	}
	return { node: obj, next: i };
}

/** Baseline serializeValue — mirrors FrontmatterBlock.vue exactly. */
function serializeValue(value: YamlNode, indent = 0): string {
	const pad = "  ".repeat(indent);
	if (value === null || value === undefined) return "~";
	if (typeof value === "string") {
		if (/^[-?:,[\]{}#&*!|>'"%@`]|:\s|^\s|\s$|^\d+$/.test(value)) {
			return JSON.stringify(value);
		}
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		if (value.every((v) => typeof v !== "object" || v === null)) {
			return `[${value.map((v) => serializeValue(v)).join(", ")}]`;
		}
		return value
			.map((v) => `${pad}- ${serializeValue(v, indent + 1)}`)
			.join("\n");
	}
	return Object.entries(value)
		.map(([k, v]) => `${pad}${k}: ${serializeValue(v, indent + 1)}`)
		.join("\n");
}

export default function FrontmatterBlock({ src }: { src: string }) {
	const text = useMemo(() => {
		const { frontmatter } = splitFrontmatter(src);
		if (!frontmatter) return null;

		const lines = frontmatter.split("\n");
		const { node, next } = parseBlock(lines, 0, 0);
		if (
			next === 0 ||
			typeof node !== "object" ||
			node === null ||
			Array.isArray(node)
		) {
			return null;
		}
		const filtered = Object.fromEntries(
			Object.entries(node).filter(([k]) => !HIDE_KEYS.has(k)),
		);
		if (Object.keys(filtered).length === 0) return null;
		return serializeValue(filtered);
	}, [src]);

	if (text === null) return null;

	return (
		<div className="frontmatter-block">
			<pre>{text}</pre>
		</div>
	);
}
