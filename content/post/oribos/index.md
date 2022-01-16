---
title: Development Environment
subtitle:  Time to take some time and improve my development experience for my home development and operations repository Oribos. 
date: 2021-11-29T00:09:04.225Z
summary: Setting up tilt with k3ds is easy
draft: true
featured: false
authors:
  - admin
lastmod: 2021-11-29T00:00:00Z
tags:
  - Devenv
  - Tilt
  - k3d
categories:
  - Fun
  - Coding
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## DevOps repository for my own projects

Time to take some time and improve my development and operations experience for my own projects. 
At the moment for my personal projects i have a docker-compose file for orchestration
and a dev and production container definition file for dev containers that support live relead support
and production containers that start server services.

The new setup shall have some more convenience and be more in line with production environments
- https/ssl support with valid certificates in development environment
- ability to protect certain endpoints  
- live reload out of the box. No more need for specific dockerfiles
- secure and unified secret management