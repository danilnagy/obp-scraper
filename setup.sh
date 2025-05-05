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

echo "Installing pnpm..."
sudo npm install -g pnpm

# Clone or update the repo
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR exists. Pulling latest changes..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "Installing packages with pnpm..."
pnpm install
pnpm exec playwright install

echo "Starting scraper server..."
# You can replace this with pm2 or systemd if preferred
nohup pnpm start > out.log 2>&1 &
echo "Server started in background. Logs: $APP_DIR/out.log"
