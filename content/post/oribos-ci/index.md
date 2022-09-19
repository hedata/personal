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
Just connecting to the remote server and executing some sh scripts and automating the manual tasks i did anyway is good enough?

This would then make the plan like this:
1. create a github action pipeline for each service which builds a docker image and pushes it to a registry
2. adapt docker-compose so in prod it pulls images from the registry
3. the pipeline then connects to the deployment machine restarts the docker-compose file and pulls the new images

## 1 Pipeline
github has an amazing template for building a dockerimage and deploying it to a registry
```yaml
name: Docker

# This workflow uses actions that are not certified by GitHub.
# They are provided by a third-party and are governed by
# separate terms of service, privacy policy, and support
# documentation.

on:
  #schedule:
  #  - cron: '42 1 * * *'
  push:
    branches: [master]
    # Publish semver tags as releases.
    tags: ["v*.*.*"]
  pull_request:
    branches: [master]

env:
  # Use docker.io for Docker Hub if empty
  REGISTRY: ghcr.io
  # github.repository as <account>/<repo>
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      # This is used to complete the identity challenge
      # with sigstore/fulcio when running outside of PRs.
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      # Install the cosign tool except on PR
      # https://github.com/sigstore/cosign-installer
      - name: Install cosign
        if: github.event_name != 'pull_request'
        uses: sigstore/cosign-installer@d6a3abf1bdea83574e28d40543793018b6035605
        with:
          cosign-release: "v1.7.1"

      # Workaround: https://github.com/docker/build-push-action/issues/461
      - name: Setup Docker buildx
        uses: docker/setup-buildx-action@79abd3f86f79a9d68a23c75a09a9a85889262adf

      # Login against a Docker registry except on PR
      # https://github.com/docker/login-action
      - name: Log into registry ${{ env.REGISTRY }}
        if: github.event_name != 'pull_request'
        uses: docker/login-action@28218f9b04b4f3f62068d7b6ce6ca5b26e35336c
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Extract metadata (tags, labels) for Docker
      # https://github.com/docker/metadata-action
      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@98669ae865ea3cffbcbaa878cf57c20bbf1c6c38
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

      # Build and push Docker image with Buildx (don't push on PR)
      # https://github.com/docker/build-push-action
      - name: Build and push Docker image
        id: build-and-push
        uses: docker/build-push-action@ac9327eae2b366085ac7f6a2d02df8aa8ead720a
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      # Sign the resulting Docker image digest except on PRs.
      # This will only write to the public Rekor transparency log when the Docker
      # repository is public to avoid leaking data.  If you would like to publish
      # transparency data even for private images, pass --force to cosign below.
      # https://github.com/sigstore/cosign
      - name: Sign the published Docker image
        if: ${{ github.event_name != 'pull_request' }}
        env:
          COSIGN_EXPERIMENTAL: "true"
        # This step uses the identity token to provision an ephemeral certificate
        # against the sigstore community Fulcio instance.
        run: cosign sign ${{ steps.meta.outputs.tags }}@${{ steps.build-and-push.outputs.digest }}

```
## 2 adapt docker-compose so in prod it pulls images from the registry
at the moment in docker-compose there are build descriptions like:
```yaml
build:
      context: ./services/reboting_fulfillment
      dockerfile: Dockerfile.dev
```
in prod we have to reference images like:
```yaml
image: traefik:2.5
```
meaing the build has to be removed and image has to be added.
there are different options for solving this.
1. use overrides in docker-compose
2. use tilt to build local images

for both options images can be changed via env vars
## 3 pull images on deployment machine
A quick google search reveals that at least the idea of executing remote ssh commands is not a new one :-) 
[ssh-action](https://github.com/appleboy/ssh-action)

So lets create a new ssh key pair with command 
```bash
ssh-keygen -t rsa -b 4096 -C -f ~/.ssh/reboting_cicd
```