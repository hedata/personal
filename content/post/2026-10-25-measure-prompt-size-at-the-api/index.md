---
title: Measure prompt size at the API, not in the tool's summary
subtitle: A dashboard can file a real saving under another heading
date: 2026-10-25T07:00:00.000Z
summary: A tool's own breakdown of its prompt can show no change for a trim that removed 5,095 tokens. The input-token count in the API's usage field is the number to budget with, and a fixed minimal prompt is how to read it cleanly.
draft: false
authors:
  - admin
tags:
  - LLM
  - Context Engineering
  - Token Budget
categories:
  - Machine Learning
---

Claude Code is Anthropic's coding agent: a program you run from a terminal that reads a codebase, edits it and runs its tests on your instruction, with a language model doing the thinking. Before it reads your first word it has already sent that model a system prompt, its tool definitions, your instruction files and a listing of skills, which are slash commands with a one-paragraph description each. I run it unattended, so every task of mine starts a fresh session through automation and that startup context is paid again on each task. That makes it a budget line, and a budget line needs a number you can trust. The question is which one, because for the same change the tool's own summary and the API gave me two different answers.

## A breakdown says where to cut, not whether the cut worked

The tool has a `/context` command that prints how much of the prompt each contributor takes, system prompt, tools, connected servers, instruction files, the skills listing, with a total; [the costs page](https://code.claude.com/docs/en/costs) points to it when you want to see what takes the space. A breakdown like that answers one question well, where to cut, and the next one badly, whether the cut worked. Its rows are headings somebody chose, and a change that moves an item from one heading to another leaves their sum where it was. My trim did exactly that: 21 skill descriptions left the startup context (the skills stay listed and callable, only the description goes), and in that version of the tool a skill without its description is counted under system tools instead of under skills, so by my own readings the two rows went from 7.4k and 3.1k to 2.7k and 7.8k, the same 10.5k before and after. The figure shows the one change read both ways.

![Bar chart in tokens: the tool's skills and system tools rows read 10,500 before and 10,500 after the trim, while the API's first-request input falls from 35,458 to 30,363, which is 5,095 fewer.](figure.png)

## The API's usage field is the number to budget with

The API reports what it was actually sent. For a request, the total input is `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`, which [the prompt-caching documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) gives as the formula for total input tokens. The tool's JSON output carries those three fields, so a measurement is one command: run the tool once with a minimal prompt such as "Reply with the single word ok." in print mode with JSON output, and add the three numbers. I did that three times before and three times after the trim, on Claude Code 2.1.305 with the default model, and all three samples were identical each time. With the tool's connected servers attached the first request went from 35,458 to 30,363 tokens, and with none attached from 30,207 to 25,112. Both rows save 5,095.

Anthropic also offers [a token-counting endpoint](https://docs.anthropic.com/en/docs/build-with-claude/token-counting), but its page calls the result an estimate that may differ slightly from the tokens used when the message is created. For a budget I prefer the count from a real request: it is what the request actually carried, and it covers the whole startup context, including the parts you did not write.

The honest caveat is that this clean number lives in the controlled setting: two unattended sessions after the change started with 59,682 and 55,871 tokens against 60,689 before, my own readings again, and the 3.8k between two identical setups is nothing but their different prompts, so in real traffic the saving is real and buried.

## Budget with the usage field of a fixed prompt

If you budget tokens for an application, take your measurement from the API's usage fields on a fixed minimal prompt, with a few repeats to see whether the samples agree. Run it with and without your change, and keep the per-contributor breakdown for deciding where to cut, not for checking the cut. Where the two disagree, the API is the one that was billed.
