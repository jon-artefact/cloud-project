# Get the latest version of the build
docker-compose pull anon-chat
# Stop and remove existing containers
docker stop cloudproject_mongo_1
docker rm cloudproject_mongo_1
docker stop cloudproject_traefik_1
docker rm cloudproject_mongo_1
docker stop cloudproject_anon-chat_1
docker rm cloudproject_mongo_1
# Start our containers
docker-compose up -d
