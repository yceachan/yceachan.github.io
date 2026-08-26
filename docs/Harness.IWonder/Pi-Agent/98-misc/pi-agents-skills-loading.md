---
title: pi 的 AGENTS.md 与 SKILL 加载规则
tags: [pi, pi-ai, context-files, skills]
desc: 上下文文件（AGENTS.md/CLAUDE.md）全局只认 ~/.pi/agent/，项目侧逐级上溯、与信任无关、全量注入；技能（SKILL.md）渐进披露、项目侧信任门控、根级 .md 仅 pi 类目录生效；~/.agents/ 只装技能
update: 2026-08-24

---

# pi 的 AGENTS.md 与 SKILL 加载规则

> [!note]
> **Ref:** \$PI_ROOT/README.md「Context Files」 | docs/skills.md | docs/security.md（$PI_ROOT = pi-coding-agent 安装目录）

## 上下文文件（AGENTS.md / CLAUDE.md）

- **全局**：`~/.pi/agent/AGENTS.md`（唯一位置）。`~/.agents/AGENTS.md` 永不加载——`~/.agents/` 只装技能。
- **项目**：cwd 逐级上溯到文件系统根，每目录取一个，候选优先级 `AGENTS.override.md > AGENTS.md > AGENTS.MD > CLAUDE.md > CLAUDE.MD`（override 只替换所在目录）。
- **拼接**：全局 → 外层祖先 → … → cwd，全量注入 system prompt 的 `project_context` 段；与项目信任无关；`-nc` / `--no-context-files` 全局禁用。
- 验证：启动头部列出已加载的 AGENTS.md 清单。

## 技能（SKILL.md）

| 位置 | 根级 .md | 信任 |
| :--- | :--- | :--- |
| `~/.pi/agent/skills/` | 视为独立技能 | 无 |
| `~/.agents/skills/` | 忽略 | 无 |
| `.pi/skills/`（仅 cwd） | 视为独立技能 | 需信任 |
| `.agents/skills/`（cwd 上溯至 git 根） | 忽略 | 需信任 |
| settings `skills` 数组 / `--skill` | 视同显式路径 | — |

发现规则：目录含 `SKILL.md` 即技能根、不再深入；否则递归子目录，子目录内只认 `SKILL.md`；根级 `.md` 仅 pi 类入口生效（agents 类忽略，避免污染多 harness 共享目录）。

加载机制：启动只注入 frontmatter `name`+`description` 的 XML 列表，全文按需 `read`（渐进披露）；缺 `description` 不加载；同名冲突先到先得；`disable-model-invocation: true` 只走 `/skill:name`；`--no-skills` 关自动发现。

## 速查

| 维度 | 上下文文件 | 技能 |
| :--- | :--- | :--- |
| 注入 | 全文常驻 | 仅描述，按需 read |
| 全局位置 | `~/.pi/agent/` 一处 | `~/.pi/agent/skills/` + `~/.agents/skills/` |
| 信任门控 | 无 | 有（项目侧） |
| 禁用 | `-nc` | `--no-skills` |

关键源码：`resource-loader.js`（上下文加载）、`skills.js`（技能扫描）、`package-manager.js`（路径汇总）、`trust-manager.js`（信任门控）。