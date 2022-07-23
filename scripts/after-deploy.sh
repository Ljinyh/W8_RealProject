#!/bin/bash
REPOSITORY=/home/ubuntu/W8_RealProject

cd $REPOSITORY

npm install
sudo pm2 restart server