#!/bin/bash
##
##  Setup script that should make life easier
##
##
echo 'This will set you up...'
echo
echo

{
    V="$(node -v)" && echo "Using node version $V"
} || {
    echo
    echo "Node is not installed. You definitely need node to proceed :) I recommend using NVM https://github.com/nvm-sh/nvm"
    exit 1
}

{
    V="$(npm -v)" && echo "NPM Version $V"
} || {
    echo
    echo "NPM is not installed. Your PATH is probably messed up. Make sure you have npm and yarn in it. Maybe even nvm screwed up."
    exit 1
}

{
    yarn install
} || {
    echo
    echo "Yarn is not installed or is not in the PATH."
    exit 1
}

yarn env:local

{
    docker-compose --version
} || {
    echo
    echo "docker-compose is not installed. This step is only relevant for seeding MongoDB which I run in Docker."
    echo "If you use local MongoDB Daemon, feel free to skip this last step :)"
    exit 1
}

echo
echo
echo "Setting up mongo_data folder. We'll need sudo for that"
echo

sudo rm -rf ./mongo_data
mkdir mongo_data
sudo chown 1001 ./mongo_data

echo
echo
echo "Seeding mongodb"
echo

docker-compose up -d mongo && yarn seed && docker-compose down

echo
echo

echo "You're probably all set :)"
