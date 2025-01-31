#!/bin/bash

set -e

PM2_NAME=untis-notifier

if [ -n "$(git status --porcelain)" ]; then
  echo "There are uncommitted changes. Please commit or stash them before deploying."
  exit 1
fi

git pull origin master
git checkout master
npm ci

#npm run migrate

PM2_PID=$(pm2 pid $PM2_NAME)

if [ -n "$PM2_PID" ]; then
  pm2 restart $PM2_NAME
else
  pm2 start --name $PM2_NAME npm -- start
fi

pm2 save
