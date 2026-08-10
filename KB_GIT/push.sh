#!/usr/bin/env bash
# KB_GIT push hook
# Invoked by hooks/post-receive after docs/<sync> has been refreshed for a
# specific upstream repo. Stages that subtree and commits (if anything
# changed). Pushing to a remote is OPTIONAL in the local-first model:
# only when KB_PUSH_REMOTE is set (e.g. KB_PUSH_REMOTE=origin).
#
# Args (all required, passed by the post-receive hook):
#   $1 REPO_NAME   upstream bare-repo name (e.g. MPUthings)
#   $2 BRANCH      upstream branch just pushed (e.g. main)
#   $3 NEWREV      upstream commit SHA
#   $4 SYNC        docs/<sync> subdir that was refreshed

set -euo pipefail

# Git hooks inherit GIT_DIR=. (pointing at the bare repo). If we leave it set,
# every git command in this script would still target the MCUthings / MPUthings
# bare repo even after `cd` into the working ea-kb checkout. Unset the trio so
# the git commands below resolve ea-kb's .git naturally.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_QUARANTINE_PATH GIT_OBJECT_DIRECTORY

REPO_NAME="${1:?repo name}"
BRANCH="${2:?branch}"
NEWREV="${3:?newrev}"
SYNC="${4:?sync}"

KB_GIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EA_KB_ROOT="$(cd "$KB_GIT_DIR/.." && pwd)"

log() { printf '[kb-push] %s\n' "$*" >&2; }

cd "$EA_KB_ROOT"

SYNC_DIR="docs/${SYNC#/}"
if [[ ! -d "$SYNC_DIR" ]]; then
  log "expected $SYNC_DIR missing — skipping"
  exit 0
fi

git add -A -- "$SYNC_DIR"

if git diff --cached --quiet -- "$SYNC_DIR"; then
  log "no change staged under $SYNC_DIR — skipping commit"
  exit 0
fi

TS="$(date '+%Y-%m-%d %H:%M')"
MSG="notes : ${SYNC_DIR#docs/} ${TS}"
git commit -m "$MSG" >/dev/null
log "committed: $MSG (${REPO_NAME}@$(git -C "$KB_GIT_DIR/$REPO_NAME" rev-parse --short "$NEWREV" 2>/dev/null || echo "$NEWREV") branch=$BRANCH)"

# Local-first: commit locally, push only when explicitly requested.
# `git push` to the GitHub remote was the VPS/Pages-era behaviour; the local
# SPA consumes docs/ directly from this checkout, so no push is needed.
if [[ -n "${KB_PUSH_REMOTE:-}" ]]; then
  if git push "$KB_PUSH_REMOTE" 2>&1 | sed 's/^/[kb-push] git: /' >&2; then
    log "push complete ($KB_PUSH_REMOTE)"
  else
    log "push failed"
    exit 1
  fi
else
  log "local-only: KB_PUSH_REMOTE unset, skipping remote push"
fi
