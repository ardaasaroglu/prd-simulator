# Changelog

## 0.1.0 (2026-10-14)

First public release.

* `/prd-simulator:simulate` takes a PRD, an epic or user stories, as file paths or pasted text, and writes a Pre-Handoff Simulation Report.
* The skill launches six developer seats in parallel as plugin subagents: Backend, Frontend and mobile, Integrations, Data and analytics, Security and privacy, QA and release. Each logs only what would stop it or force a silent guess. If the plugin agent types are rejected, it uses general-purpose subagents told to use only Read, Grep and Glob.
* A skeptic subagent re-reads the spec from scratch for each seat and sorts every finding into dev blocker, scope question or noise.
* The report groups dev blockers into blockers, silent assumptions, missing requirements and integration gaps, lists scope questions and dropped noise separately, and ends with a punch list.
* Options: `--seats` to run a subset, `--out` for the report path, `--context` for files that record decisions already made. A directory given as the spec stands for the `.md` and `.txt` files in it.
* Falls back to running the seats one after another in a single context when subagents are not available.
* Two fictional example specs with example reports, three eval cases for `claude plugin eval`, and structural tests that run with Node alone.
