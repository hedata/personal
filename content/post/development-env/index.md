---
title: Development Environment - tilt
subtitle:  Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest a
  strategy.
date: 2021-11-29T00:09:04.225Z
summary: Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest a
  strategy.
draft: false
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

## Development Environment - tilt
Time to take some time and improve my development experience. 
At the moment for my personal projects i have a docker-compose file for orchestration
and a dev and production container definition file for dev containers that support live relead support
and production containers that start server services.

[Tilt](https://docs.tilt.dev/) offers "a toolkit for fixing the pains of microsverice development". 
Among other things tilt offers:  "live_update Tilt’s live_update deploys code to running containers, in seconds not minutes. Even for compiled languages or changing dependencies, live_update is fast and reliable.".

Tilt needs docker on the system and a local [kuberenetes cluster](https://docs.tilt.dev/choosing_clusters.html).

## Install MicroK8s
For ubuntu users MicroK8s is recommended and can be installed via: 

```bash
sudo snap install microk8s --classic && \
sudo microk8s.enable dns && \
sudo microk8s.enable registry
```
add your user to the group
```bash
sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube
newgrp microk8s
```

Turn on the services you want for example:
```bash
microk8s enable dashboard dns registry istio
```

Try 
```microk8s enable --help
```
for a list of available services and optional features. microk8s disable <name> turns off a service.

```
microk8s dashboard-proxy
```
starts a monitoring dashboard.

## Install kubectl
with:
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```
Configure micro k8s for kubectl
```bash
sudo microk8s.kubectl config view --flatten > ~/.kube/microk8s-config && \
KUBECONFIG=~/.kube/microk8s-config:~/.kube/config kubectl config view --flatten > ~/.kube/temp-config && \
mv ~/.kube/temp-config ~/.kube/config && \
kubectl config use-context microk8s
```

## Install Tilt
```bash
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```
you can now start tilt with
```bash
tilt up
```

Time to add a Tiltfile and think about using helm. 