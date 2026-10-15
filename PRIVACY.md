# Privacy

PRD Simulator is a set of instructions for Claude: one skill and seven subagents written in Markdown. It has no server, no account and no analytics.

## What it reads

* The spec you give it: file paths, text you paste, or a document you attach.
* Context files you name with `--context`.

It reads nothing else on your machine or in your account.

## Where your spec goes

Only to Claude, the assistant you are already using, as part of your conversation. In Claude Code and Cowork, the seat and skeptic subagents are also Claude, reading the same spec. The plugin makes no network calls of its own and sends nothing to any other service, including the author.

## What it writes

* In Claude Code and Cowork: one Markdown report in your working folder, named `prd-simulation-<spec>-<date>.md`, or at the path you give with `--out`.
* In claude.ai chat: the report appears in the conversation, or as a file in that chat if file creation is on.

It never edits your spec. It stores nothing else and keeps no logs.

## Data handling by Claude

How Anthropic handles your conversations is set by your Claude plan and Anthropic's own privacy policy, not by this plugin.

## Contact

Open an issue at https://github.com/ardaasaroglu/prd-simulator/issues. For a security problem, use private vulnerability reporting as described in [SECURITY.md](SECURITY.md).
