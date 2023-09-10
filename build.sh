#!/bin/bash
##
##  Build script for limitless mings and similar structure projects.
##  This being:
##    - Azure
##    - Synapps yarn monorepo sctructure
##    - Single docker-compose for build, no docker-compose in development
##
##  Author: Yurii Sichkovskyi (yurii@synapps.agency)
##
ENV=prod
SERVICES='api'
CACHE='--no-cache'
SUFFIX=''

echo "====================================\bun"
echo "BUILDING SERVICES\n"

while [ "$1" ]; do
  case $1 in
    --env|-e)
      shift
      ENV=$1 ;;
    --services|-s)
      shift
      echo "ONLY: $1"
      SERVICES=$1 ;;
    --cache|-c)
      echo "CACHE ENABLED"
      CACHE='' ;;
    --version-suffix|-vs)
      shift;
      SUFFIX="-$1" ;;
    --alpha|-a)
      shift;
      SUFFIX="-alpha.$1" ;;
    --dry|-d)
      echo "DRY RUN"
      DRYRUN=1 ;;
    --skip-tests|-st)
      echo "SKIPPING TESTS"
      SKIPTESTS=1 ;;
    --skip-build|-sb)
      echo "SKIPPING TESTS"
      SKIPBUILD=1 ;;
    --help|-h)
      HELP=1 ;;
    *)
      VERSION=$1 ;;
  esac
  shift
done

function cancel_and_exit {
  cat .secret.env .local.env > .env
  docker-compose down

  CODE=0

  if [ -z $1 ]; then
    CODE=$1
  fi

  if ! [ -z "$2" ]; then
    echo $2
  fi

  exit $1
}

function deploy {
  for service in $SERVICES; do
    # Tag built image with ACR version
    docker tag gabl_$service gabl.azurecr.io/gabl_$service:v$VERSION$SUFFIX
    # Push image to ACR
    docker push gabl.azurecr.io/gabl_$service:v$VERSION$SUFFIX

    if [ "$ENV" != 'test' ]; then
      # Bump version in config yml file
      sed -i'.bak' "s/\(image\:.*:v\).*/\1$VERSION$SUFFIX/" ./kubernetes/$service-$ENV.yml
      # Apply config to kubectl
      kubectl apply -f ./kubernetes/$service-$ENV.yml
    fi
  done
}

if ! [ -z $HELP ]; then
  echo
  exit 0
fi

echo "ENV: $ENV"
echo "VERSION: $VERSION$SUFFIX\n"
echo "====================================\n\n"


# Build images if not explicitly skipped
if [ -z $SKIPBUILD ]; then
  # Apply prod env
  cp .$ENV.env .env
  # Build images
  docker-compose build $CACHE $SERVICES || cancel_and_exit 1 "Build Failed"
fi

# Run tests in docker-compose if not explicitly skipped
if [ -z $SKIPTESTS ]; then
  docker-compose down
  docker-compose up -d

  docker exec gabl_api_1 npm run seed || cancel_and_exit 1 "Seed Failed"
  yarn test-local -- --headless || cancel_and_exit 1 "Tests Failed"
fi


if [ -z $DRYRUN ] && [ "$ENV" != 'test' ]; then
  echo "You are about to deploy the app version $VERSION$SUFFIX to $ENV"
  echo "Write \"$ENV\" to continue"
  read -r input

  if [ "$input" = "$ENV" ]; then
    deploy
  else
    echo "Deploy cancelled"
    cancel_and_exit
  fi
fi

# Apply prod env
cancel_and_exit
