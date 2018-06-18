# Docker-CI

Mini CI platform working only with elassandra-docker.

Minimum requirements:
* docker
* node 8 or higher
* npm
* openssh-client

Init:
```
mkdir -p keys
ssh-keygen -t rsa -f keys/id_rsa
# upload the keys/id_rsa.pub to github
cp docker-compose.env.dist docker-compose.env
vi docker-compose.env
...
```

Development servers:
```
docker run --rm -it -p 6379:6379 redis
npm run watch
npm run watch-worker
```

Production servers
```
docker run --rm -it -p 6379:6379 redis
npm run build
npm run serve
npm run server-worker
```

Production server within docker:
```
npm run build
docker-compose build
docker-compose up

# update docker containers
npm run compose-update
```


Visit `localhost:3000`
