#!/bin/bash
docker network create armariobot_network
cd ./db/
docker-compose up -d
cd ../bot/
docker-compose up -d