#!/usr/bin/env bash

set -e

if [ "$DEBUG" = "true" ]; then
  set -x
fi

ssh-keyscan github.com >> ~/.ssh/known_hosts
git config --global user.name "$GIHTUB_USER"
git config --global user.email "$GITHUB_EMAIL"
docker login --username="$DOCKER_HUB_USER" --password="$DOCKER_HUB_PASSWORD"
exec npm run serve