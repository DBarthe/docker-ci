# Docker-CI

Mini CI platform working only with elassandra-docker.

Minimum requirements:
* docker
* node 8 or higher
* npm

Init:
```
mkdir -p keys
ssh-keygen -t rsa -f keys/id_rsa
# upload the keys/id_rsa.pub to github
cp docker-compose.env.dist docker-compose.env
vi docker-compose.env
...
```

Development server:
```
npm watch
```

Production server
```
npm build
npm serve
```

Production server within docker:
```
docker-compose build
docker-compose up
```

Visit `localhost:3000`
