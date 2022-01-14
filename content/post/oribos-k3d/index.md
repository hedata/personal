---
title: Locale Kubernetes Environment
subtitle:  Trying out a locale kubernetes environment with tilt and k3d
date: 2021-11-30T00:09:04.225Z
summary: Setting up mongodb with tilt on k3d with mongoexpres as admin ui is easy
draft: true
featured: false
authors:
  - admin
lastmod: 2021-11-30T00:00:00Z
tags:
  - Devenv
  - Kubernetes
  - Mongodb
  - tilt
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

##  Locale Kubernetes Environment

### install k3d
k3d is a fast kubernetes cluster and has a very low memory footprint.
perfect for local deving.

```bash
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
```

### install kubectl
with:
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### helm

```bash
curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
sudo apt-get install apt-transport-https --yes
echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```


### Create cluster 

```
k3d cluster create devcluster \
--servers 1 --agents 1 \
--api-port 127.0.0.1:6443 \
-p 80:80@loadbalancer \
-p 443:443@loadbalancer \
--volume $(pwd)/data:/data \
--k3s-arg "--disable=traefik@server:0"
```

A few things to note:
* We map localhost ports 80 and 443 to the k3s virtual loadbalancer. This will allow us to reach the ingress resources directly from the localhost on our machine
* the cluster is deployed without the default Traefik Ingress Controller
* we add a volume from our local machine to /data on every node so we can persist data and have it on our local machine

When this is finished kubectl should jump automatically to the new cluster
check with:
```
kubectl cluster-info
```

### Add traefik as load balancer

as reverse proxy for ssl and auth we take [traefik](https://github.com/traefik/traefik/).
for this we can use a ready helm chart
lets [install helm](https://helm.sh/docs/intro/install/)


### Traefik
add the chart repo
```bash
helm repo add traefik https://helm.traefik.io/traefik
```
The cluster config of treafik will be done in the tiltfile.

### Tilt
[Tilt](https://docs.tilt.dev/) offers "a toolkit for fixing the pains of microsverice development". 
Among other things tilt offers:  "live_update Tilt’s live_update deploys code to running containers, in seconds not minutes. Even for compiled languages or changing dependencies, live_update is fast and reliable.".

Tilt needs docker on the system and a local [kuberenetes cluster](https://docs.tilt.dev/choosing_clusters.html).

```bash
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```
you can now start tilt with
```bash
tilt up
```

### Maintenance
Sometimes it is necessary to cleanup stuff.. and deleting images from the cluster is nice
```
docker exec k3d-devcluster-server-0 sh -c  "ctr image list -q"
```
some resources [cleanup parts](https://github.com/rancher/k3d/issues/133)
