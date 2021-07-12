---
title: Testing QuantConnect Lean CLI
subtitle: Having some holiday time taking the new QuantConnect Lean CLI for a spin and see how easy it is to get it up and running and backtest an easy strategy.

# Summary for listings and search engines
summary: Having some holiday time taking the new QuantConnect Lean CLI for a spin and see how easy it is to get it up and running and backtest an easy strategy.

# Link this post with a project
projects: []

# Date published
date: "2021-07-13T00:00:00Z"

# Date updated
lastmod: "2021-07-13T00:00:00Z"

# Is this an unpublished draft?
draft: false

# Show this page in the Featured widget?
featured: false

# Featured image
# Place an image named `featured.jpg/png` in this page's folder and customize its options here.
image:
  caption: 'Image credit: [**Unsplash**](https://unsplash.com/photos/CpkOjOcXdUY)'
  focal_point: ""
  placement: 2
  preview_only: false

authors:
- admin

tags:
- Algorithmic Trading
- Python

categories:
- Fun
---

## QuantConnect Lean CLI
[The Lean CLI](https://github.com/QuantConnect/lean-cli) is a cross-platform CLI aimed at making it easier to develop with the LEAN engine locally and in the cloud.

With Python and Docker installed the ClI is only one command away.
```bash 
pip install --upgrade lean
```
If you get some path warnings - add ~/.local/bin to your PATH environment variable.

After installing the CLI, open a terminal in an empty directory and run 
```bash
lean init 
```
to create a project.