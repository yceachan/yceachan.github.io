#!/usr/bin/env bash
set -euo pipefail

HOST="${VPS_HOST:-vps}"
REMOTE_DIR="${VPS_DIR:-$HOME/work/ea-pi}"

ssh "$HOST" "cd '$REMOTE_DIR' && git pull --ff-only"
