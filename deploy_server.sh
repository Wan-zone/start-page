#!/usr/bin/env bash
set -euo pipefail

# 服务器前端部署脚本
# 默认目标目录：
#   /www/wwwroot/8.152.202.142/start-page
# 要求：前端文件直接落在目标目录，不再套一层子文件夹。

SOURCE_DIR="/home/wan/my-little-projects/start-page"
TARGET_DIR="/www/wwwroot/8.152.202.142/start-page"

mkdir -p "$TARGET_DIR"

rsync -av --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'AGENTS.md' \
  --exclude '.gitignore' \
  "$SOURCE_DIR"/ "$TARGET_DIR"/

echo "Frontend deployed to: $TARGET_DIR"

