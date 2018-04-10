FROM node:9-alpine

ENV NODE_ENV production

ENV BASIC_AUTH_USER changeit
ENV BASIC_AUTH_PASSWORD changeit
ENV DOCKER_HUB_USER changeit
ENV DOCKER_HUB_PASSWORD changeit
ENV GITHUB_USER changeit
ENV GITHUB_EMAIL changeit

RUN apk add --no-cache git openssh-client curl bash

RUN mkdir -p /root/.ssh

ENV VERSION "17.03.1-ce"
RUN curl -L -o /tmp/docker-$VERSION.tgz https://download.docker.com/linux/static/stable/x86_64/docker-$VERSION.tgz \
    && tar -xz -C /tmp -f /tmp/docker-$VERSION.tgz \
    && mv /tmp/docker/docker /usr/bin \
    && rm -rf /tmp/docker-$VERSION /tmp/docker

WORKDIR /usr/bin/app

COPY entrypoint.sh /entrypoint.sh

COPY package*.json ./
RUN npm install --only=production

COPY public ./public
COPY views ./views
COPY dist ./dist

ENTRYPOINT [ "/bin/bash", "/entrypoint.sh" ]