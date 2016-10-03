#!/usr/bin/env bash

# place holder for any tasks to run after codedeploy installs a new revision
cd /srv/app
echo "downloading s3://chronicled-ops/user_data/chronicled-drone-server-config.json..."
aws s3 cp s3://chronicled-ops/user_data/chronicled-drone-server-config.json ./config.json --region us-west-2
chown ubuntu:ubuntu config.json

# update permissions and npm install
sudo chown -R ubuntu:ubuntu *
npm install > /srv/shared/logs/npm_install.log

