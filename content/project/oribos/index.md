---
title: Development Environment
subtitle: Time to take some time and improve my development experience for my home development and operations repository Oribos.
date: 2021-11-29T00:09:04.225Z
summary: Planning a new personal development environment
draft: false
featured: true
authors:
  - admin
lastmod: 2021-11-29T00:00:00Z
tags:
  - Tilt
  - k3d
  - Docker
categories:
  - Devenv
  - Fun
  - Coding
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## Personal DevOps repository for my own projects

Personal development and operations repository.

Helps if you want to create, run , monitor and maintain

- web applications
- apis
- real time streams
- databases
- messaging systems
- etl pipelines
- machine learning models
- persistent storage

in a secure environment on your own server
with your own domains (including subdomains)

with dns and ssl via cloudflare

Time to take some time and improve my development and operations experience for my own projects.
At the moment for my personal projects i have a docker-compose file for orchestration
and a dev and production container definition file for dev containers that support live relead support
and production containers that start server services.

The new setup shall have some more convenience and be more in line with production environments

- https/ssl support with valid certificates in development environment
- ability to protect certain endpoints
- code reloads on save in visual studio code
- secure and unified secret management
- easy deployment via github actions

I started with k3d

- [K3d]({{< ref "/post/oribos-k3d" >}} "K3d")
- [MongoDB]({{< ref "/post/oribos-mongodb" >}} "MongoDB")

but soon saw that for a personal environment going full on kubernetes
is a bit of an overkill.

So i stayed with docker-compose.

I added

- traefik for easy ingress routing and https support
- oauth2_proxy for easy authentication
- portainer for easy container management
- glances for easy system monitoring
- dnsmasq for easy dns management

I am evaluating watchtower for automatic container updates
https://containrrr.dev/watchtower/
