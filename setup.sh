#!/bin/bash
set -e

REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
APP_DIR="/home/ubuntu/scraper"

echo "Installing dependencies..."
sudo apt update
sudo apt install -y curl git build-essential

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Cloning repo..."
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "Installing NPM packages..."
npm install
npx playwright install

echo "Running scraper server..."
# You can change this to pm2 if desired
nohup npm start > out.log 2>&1 &
echo "Server started in background. Logs: $APP_DIR/out.log"
