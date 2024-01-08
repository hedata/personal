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

## Elevating My Development and Operations Workflow: A Journey in Personal DevOps

In the realm of personal project DevOps, the quest for efficiency and security is ongoing. I've embarked on a mission to refine my development and operations workflow, focusing on a suite of essential components. This endeavor aims to create, run, monitor, and maintain a variety of systems:

- Web applications
- APIs
- Real-time data streams
- Databases
- Messaging systems
- ETL pipelines
- Machine learning models
- Persistent storage

All these are to be housed securely on my server, complete with personalized domains and subdomains, fortified with DNS and SSL via Cloudflare.

**Current Setup and the Push for Enhancement**

Currently, my setup revolves around Docker Compose for orchestration, with distinct container definitions for development and production. Development containers are configured for live reload support, while production ones are optimized to start server services efficiently.

However, I'm now looking to upgrade my setup to better align with professional production environments. Key enhancements include:

- HTTPS/SSL support with valid certificates for the development environment
- Enhanced endpoint security
- Real-time code reloads in Visual Studio Code
- A unified approach to secure secret management
- Simplified deployment processes via GitHub Actions

Initially, I dabbled with [K3d]({{< ref "/post/oribos-k3d" >}} "K3d") and [MongoDB]({{< ref "/post/oribos-mongodb" >}} "MongoDB") , exploring the potential of a full Kubernetes setup. However, I realized that for my personal projects, this was perhaps too complex and resource-intensive, leading me back to the more manageable Docker Compose.

**Integrating New Tools for Enhanced Functionality**

To further refine my environment, I've incorporated several tools:

- **Traefik:** Simplifies ingress routing and adds HTTPS support.
- **OAuth2 Proxy:** Streamlines authentication processes.
- **Portainer:** Offers hassle-free container management.
- **Glances:** Provides a bird’s-eye view of system monitoring.
- **Dnsmasq:** Facilitates easy DNS management.

Moreover, I'm currently evaluating [Watchtower](https://containrrr.dev/watchtower/) for automated container updates, aiming to ensure that my system remains up-to-date with minimal manual intervention.

**Conclusion**

This journey in personal DevOps is an ongoing process of learning and adaptation. By continually integrating new tools and practices, I aim to create a development and operations environment that is not only efficient and secure but also mirrors the sophistication of professional setups.
