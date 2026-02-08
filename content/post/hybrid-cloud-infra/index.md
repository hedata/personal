---
title: "Hybrid Cloud Infrastructure: VPS + NAS with Zero-Trust Networking"
subtitle: A clean, automated setup for self-hosting without exposing your home network
date: 2026-02-08T00:00:00.000Z
summary: Building a hybrid cloud platform that pairs a public VPS for ingress with an on-premise NAS for storage — connected via zero-trust mesh networking, deployed entirely through CI/CD.
draft: false
featured: true
authors:
  - admin
lastmod: 2026-02-08T00:00:00.000Z
tags:
  - infrastructure
  - self-hosting
  - devops
  - docker
categories:
  - Coding
  - Infrastructure
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## The Goal

Run self-hosted applications (media servers, SSO, websites) across two nodes — a public **Hetzner VPS** and a private **Synology NAS** at home — without opening any ports on the home network. Deployments are fully automated via **GitHub Actions**. No one SSHes into servers to deploy.

## The Stack

| Layer | Tool | Role |
|-------|------|------|
| **DNS** | Cloudflare | Domain management, DDoS protection |
| **Reverse Proxy** | Caddy | TLS termination, routing, forward auth |
| **Authentication** | Authentik | SSO / identity provider for all services |
| **Mesh Network** | NetBird | Zero-trust tunnel between VPS and NAS |
| **Containers** | Docker Compose | Application runtime on both nodes |
| **Secrets** | SOPS + Age | Encrypted secrets in Git, decrypted only in CI |
| **CI/CD** | GitHub Actions | Automated deployment to both nodes |

## How It Works

**Cloudflare** resolves all domains to the VPS. **Caddy** terminates TLS and checks authentication against **Authentik**. Authenticated requests to NAS-hosted apps get proxied through a **NetBird** mesh tunnel — the NAS has no public IP and no open ports.

**GitHub Actions** handles deployment: it decrypts secrets with **SOPS**, copies compose files and `.env` to the VPS via SSH, and reaches the NAS by jumping through the VPS. The servers themselves are dumb Docker hosts. They run `docker compose up -d` and nothing else.

## Why This Approach

- **No home network exposure** — the NAS is reachable only through the encrypted mesh
- **Secrets never touch servers in plaintext form** — SOPS decrypts in CI, the result is shipped and consumed
- **Git as the single source of truth** — infrastructure as code, encrypted secrets included
- **Two-node simplicity** — no Kubernetes, no orchestrator; just Docker Compose on each host

More details on the architecture and deployment flow coming in a follow-up post.
