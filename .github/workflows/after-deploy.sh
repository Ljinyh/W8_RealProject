#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo npm

sudo pm2 start server
