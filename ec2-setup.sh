#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# Clone your repository (replace with your repo URL)
git clone https://github.com/creativealvi/Daffodil-DIAA .

# Install dependencies
npm ci

# Build the app
npm run build

# Start the server with PM2
pm2 start server.js --name "diaa"

# Save PM2 process list and configure to start on system startup
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu 