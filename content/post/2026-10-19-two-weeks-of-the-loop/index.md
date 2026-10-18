---
title: Two weeks of letting the agents run the loop
subtitle: What held on its own, and what only held on paper
date: 2026-10-19T07:00:00.000Z
summary: Since early October my projects run on one loop — plan, build, measure, learn — with an implementer, a reviewer and one manager session per project. What those two weeks taught me about rules, drift and where documentation has to live.
draft: false
authors:
  - admin
tags:
  - agents
  - devops
  - workflow
categories:
  - Coding
---

Since the beginning of October my side projects run on one deliberately boring loop: plan, build, measure, learn. I wrote it down as [a decision record](https://github.com/hedata/vault-projects/blob/main/20-Projects/core/decisions/ADR-002-one-loop.md) because I kept inventing a new process for every kind of document; the record says there is exactly one loop in two sizes — a change (an issue) and a project (one run a week). Over the last two weeks most of that loop was built and run by agents. Three things stood out.

## A rule in prose is a wish

The agents' instructions had a sentence saying that every reply to me must link what it refers to — no bare `#123`, because I read on a phone where that is not clickable. The sentence was ignored about as often as it was followed. What fixed it was not a better sentence but [a Stop hook that reads the final reply and blocks it once when it finds a bare reference](https://github.com/hedata/agent-control/pull/41). The agent workstation used to start sessions with permission checks switched off entirely; [now the launch command starts them in auto mode](https://github.com/hedata/infra/pull/25), because the same setting in a config file turned out not to take effect, and only the flag does. The compose files named images as `latest`, so a redeploy could quietly change what runs; [every third-party image is now pinned to a version — the one that runs, as far as that could be established](https://github.com/hedata/infra/pull/30): for the dashboard by fingerprinting the static files the live site serves, for two others only by release dates. The lesson: if I want a rule to hold while I am not watching, it goes into a hook, a flag or CI, not into a paragraph.

## Documentation drifts unless something reads it

My wiki used to hold both the "why" (goals and decisions) and the "how" (how a repo's deploy works, which auth layer sits where). The "how" pages drifted within weeks of being written, because nobody touching the code ever touched the wiki. The fix was structural: [the wiki keeps only each project's goal and its decisions](https://github.com/hedata/core/pull/27), and [the how-it-works pages moved into the `docs/` folder of the repo they describe](https://github.com/hedata/infra/pull/19), where they change in the same pull request as the code. A weekly lint routine then reads five of those pages per run and files an issue for every claim the code does not back. The first sweep found that [the README and a compose comment described deploy behaviour the pipeline never had](https://github.com/hedata/infra/pull/32), that [two Makefile targets still deployed over the server's public address against two standing decisions](https://github.com/hedata/infra/pull/34), and that [a service's README said new users get no access while its compose file gave everyone read access](https://github.com/hedata/infra/pull/35). All of them would have misled the next person — or the next agent — reading the page as truth.

## Roles, not heroics

[One call takes an issue to a reviewed pull request](https://github.com/hedata/vault-projects/blob/main/20-Projects/core/decisions/ADR-003-implementer-and-reviewer.md): an implementer agent builds it and writes an evidence table with one row per acceptance criterion; a reviewer agent posts a verdict; on "needs changes" the implementer gets at most two fix rounds; nothing merges without me. Above that sits [one long-lived manager session per project](https://github.com/hedata/vault-projects/blob/main/20-Projects/core/decisions/ADR-004-project-managers.md) that plans, starts one fresh run per issue, watches, and reports the project's state from what is on the main branch, not from what a run's report claims. The rule I argued longest with myself about: a run gets rights only through configuration or from me in its own session, never from a message another session sends it. A manager's message is not consent.

What makes this a loop rather than a pipeline is the learn step. [Every spec pull request ends with a line saying whether the plan held or which decision it argues against](https://github.com/hedata/agent-control/pull/42), and workflow friction becomes a `flow-learning` issue — twenty of them in two days, from ["the CLI prints an empty comment thread and exits zero"](https://github.com/hedata/agent-control/issues/47) to ["the workstation image has no python3, so agent one-liners fail twenty times a week"](https://github.com/hedata/agent-control/issues/56), which [is now fixed in the image](https://github.com/hedata/infra/pull/27). That backlog is the honest measure of how far from smooth this still is.

## This post is the loop, too

Writing on this page had stalled since February. So the newest decision applies the same loop to the page itself: [a routine writes a short post every two weeks from what was merged and decided, and ships it as a pull request](https://github.com/hedata/vault-projects/blob/main/20-Projects/epu/decisions/ADR-002-personal-page-content-routine.md), through [a CI gate that checks the front matter and refuses a list of words](https://github.com/hedata/personal/pull/2) — nothing publishes without my merge. You are reading its first output. Diagrams, when they come, will be [text in the repo, rendered where they are shown](https://github.com/hedata/vault-projects/blob/main/20-Projects/epu/decisions/ADR-003-diagrams-and-pictures-as-source.md); until the design skill exists, posts are words only. I will know this works when reviewing a post takes me less time than writing one would have.
