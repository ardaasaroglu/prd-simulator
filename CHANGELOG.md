# Changelog

## 0.2.3 (2026-10-20)

* Eval graders use only the keys the plugin eval docs list. The regex graders drop `match: contains`, since finding a match is already the default, and the skill check is an unscored indicator again: scoring it in the baseline arm, where the skill cannot run, inflated the with and without difference.
* A test rejects any eval prompt or grader key the docs do not list.

## 0.2.2 (2026-10-16)

From a review in Cowork.

* The chat brief has one punch list instead of a table plus separate blocker lines: one line per dev blocker with its owner, recommended default and the spec sentence it comes from. Scope questions are listed by title only.
* When findings merged from several seats got different verdicts, the item is filed once under the strongest verdict and notes the other one.
* A merged item is marked "Verify with engineering, not confirmed" only when every merged finding needs that; otherwise it stays a spec gap and names the part to verify.

## 0.2.1 (2026-10-16)

* In claude.ai chat, the working notes before the report are now short: the seats and the skeptic run in Claude's thinking when it is available, and otherwise as one line per finding and per verdict instead of full json. A chat test of 0.2.0 printed every seat's findings as json ahead of the report.

## 0.2.0 (2026-10-15)

Ready for Anthropic's plugin directory, and usable in claude.ai chat and Cowork.

* The skill now works in claude.ai chat, where there are no subagents: it runs the seats one after another and the skeptic as a separate final pass, reads attached documents as specs, and puts the report in the conversation when it cannot write files.
* Reference files are named relative to the skill folder, so they resolve in chat as well as in Claude Code and Cowork.
* `plugin.json` adds a display name, an icon and the documentation, support and privacy links the directory shows. Validating with `--strict` now needs Claude Code 2.1.281 or later.
* New PRIVACY.md, and README sections on what runs where, example prompts, what the plugin reads, writes and sends, and troubleshooting.

## 0.1.0 (2026-10-14)

First public release.

* `/prd-simulator:simulate` takes a PRD, an epic or user stories, as file paths or pasted text, and writes a Pre-Handoff Simulation Report.
* The skill launches six developer seats in parallel as plugin subagents: Backend, Frontend and mobile, Integrations, Data and analytics, Security and privacy, QA and release. Each logs only what would stop it or force a silent guess. If the plugin agent types are rejected, it uses general-purpose subagents told to use only Read, Grep and Glob.
* A skeptic subagent re-reads the spec from scratch for each seat and sorts every finding into dev blocker, scope question or noise.
* The report groups dev blockers into blockers, silent assumptions, missing requirements and integration gaps, lists scope questions and dropped noise separately, and ends with a punch list.
* Options: `--seats` to run a subset, `--out` for the report path, `--context` for files that record decisions already made. A directory given as the spec stands for the `.md` and `.txt` files in it.
* Falls back to running the seats one after another in a single context when subagents are not available.
* Two fictional example specs with example reports, three eval cases for `claude plugin eval`, and structural tests that run with Node alone.
