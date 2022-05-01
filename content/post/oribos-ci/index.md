---
title: Continous integration and continous development for my home setup
subtitle: tbd
date: 2021-11-30T00:09:04.225Z
summary: tbd
draft: true
featured: false
authors:
  - admin
lastmod: 2022-01-14T00:00:00Z
tags:
  - best practices
  - software architecture
  - data science
  - 
categories:
  - Fun
  - Coding
  - Research
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## Why
Having to connect to a remote machine manually and pulling git repos and then starting up 
a script manually is tedious. Furthermore its not very secure to get all our code onto production machines.

## How
Well that is the big question. How can i make this better?
An option could be to 
- create a github action pipeline for each service 
- let that build a docker image and push it 
- to a registry
- then connect to a kubernetes cluster running the services and apply the changes (new image name)
- creating kubernetes secrets for all env vars

this would mean i need to setup / buy an image registry and setup a kubernetes cluster on a local machine
- which is probably overhead. And i would also have to write and maintain yaml files for the kubernetes config and the kubernetes secrets.
Thats doable and for a scalable experience the best option but a lot of effort also in regards that 
i already have a super nice docker-compose config with env vars i can already deploy.

Maybe having the secrets and env vars in files and pulling them to production is ok (we only have a single server anyway).
Just connecting to the remote server and executing some sh scripts and automating the manual tasks
i did anyway is good enough?

This would then make the plan like this:
- create a github action pipeline for each service 
- the pipeline then builds a docker image and pushes it 
- to a registry
- the pipeline then connects to the deployment machine
- updates the env and deployment repo
- restarts the docker-compose file and triggers a rebuild for the service

we have to watch out that image name is also changed for prod 

need to check how this goes together with tilt and 
automatic rebuild / code sync for images

A quick google search reveals that at least the idea of executing remote ssh commands is not a new one :-) 
[ssh-action](https://github.com/appleboy/ssh-action)

So lets create a new ssh key pair - would be ludicrous to use my ssh key in a github action!
