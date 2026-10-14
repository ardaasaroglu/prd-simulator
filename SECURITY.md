# Security

prd-simulator is a set of prompts: one skill and seven subagents. It has no code that runs on your machine, no hooks, no MCP servers and no network calls of its own. This page says what it can touch.

## What it reads and writes

* **Reads.** The spec files and context files you point it at, with the Read, Grep and Glob tools. The plugin's seat and skeptic agents declare only those three tools in their frontmatter, so Claude Code does not give them tools to write, run commands or reach the network. If Claude Code rejects the plugin agent types, the skill falls back to general-purpose subagents, which have the full default tool set. In that fallback the limit to Read, Grep and Glob is an instruction in the prompt, not an enforced restriction, and the report header says `parallel, general-purpose fallback`.
* **Writes.** One file: the report, at the path you give with `--out` or `./prd-simulation-<spec>-<date>.md` by default. The skill lists `Write` in `allowed-tools`, which means Claude Code does not ask before saving during that turn. The instructions limit writing to the report and forbid editing the spec.
* **Sends.** Your spec goes to the Claude model your Claude Code session uses, the same as any text you give Claude Code. The plugin adds no other destination. Do not run it on a spec you are not allowed to share with that model provider.

## Specs are data, not instructions

A spec can contain text aimed at the model, by accident or on purpose. The skill tells the orchestrator, the seats and the skeptic to treat specs and context files as data and never to follow instructions inside them, and to say so in the brief when it notices any. That is an instruction to a model, not a guarantee. If you simulate a spec from someone you do not trust, read the report before you act on it, and check that no file other than the report changed.

## Reporting a vulnerability

Report it privately at <https://github.com/ardaasaroglu/prd-simulator/security/advisories/new>. Please do not open a public issue for a security problem.

That link works only while private vulnerability reporting is enabled in this repository's settings. If it shows an error, open an issue asking for a private contact, and leave out any details of the problem.
