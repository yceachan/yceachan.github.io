#!/usr/bin/env bash

set -euo pipefail

KB_GIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_NAME="${1:-}"

if [[ -z "$REPO_NAME" ]]; then
	printf 'Usage: %s <repo-name>\n' "${0##*/}" >&2
	exit 1
fi

cd "$KB_GIT_DIR"
git init --bare "$REPO_NAME"
install -m 0755 "$KB_GIT_DIR/template/hooks/post-receive" "$REPO_NAME/hooks/post-receive"