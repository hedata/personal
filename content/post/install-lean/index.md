---
title: Installing the QuantConnect Lean ClI
subtitle:  Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest a
  strategy.
date: 2021-07-13T00:09:04.225Z
summary: Having some holiday time taking the new QuantConnect Lean CLI for a
  spin and see how easy it is to get it up and running and backtest a
  strategy.
draft: false
featured: false
authors:
  - admin
lastmod: 2021-07-13T00:00:00Z
tags:
  - Algorithmic Trading
  - Python
  - QuantConnect
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

## QuantConnect Lean CLI
Recently i read a lot about algorithmic trading and stumbled upon [QuantConnect](https://www.quantconnect.com/).

For strategy implementation and backtesting i will use [The Lean CLI](https://github.com/QuantConnect/lean-cli).
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
Project creation is easy with
```bash
lean create-project "testing"
```

I already got some sample strategies in the cloud so lets log into lean
and get my projects from the cloud
```bash
lean login
lean cloud pull
```

Backtesting in the cloud can be done via
```bash
lean cloud backtest "testing" --open --push
```
Works nicely
