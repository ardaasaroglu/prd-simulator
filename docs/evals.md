# Evals

The repository ships an eval suite for `claude plugin eval`. It checks three things: that the simulator finds real, quoted blockers in a gappy spec, that it does not manufacture blockers for a tight spec, and that the skill fires when someone asks in plain words.

## Results

**Not run for v0.1.0.** The cases are written and their structure is checked by `npm test`, but the suite has not been run against a model for this release, so there are no scores and no with and without delta to report yet. When a run is recorded, its date, Claude Code version, model, scores and delta will be added here.

## The cases

| Case | Prompt | Graders | Passes when |
|---|---|---|---|
| `gappy-spec-blockers` | A short, gappy PRD for recurring tasks, with a plain request to simulate it | `regex` for a punch list, `regex` for a quoted spec line, `llm` judge | At least three gaps are tied to spec sentences, at least two are among the known gaps (custom repeats, month-end and time zones, what "future tasks" means, never-completed tasks, shared projects), and the answer includes a punch list with owners and defaults |
| `tight-spec-no-noise` | A small, complete spec for a keyboard shortcut | `llm` judge | No dev blockers, or exactly one of low severity. Scope questions and dropped noise do not count |
| `natural-request-fires` | "I'm handing this epic to the engineers on Monday. What are they going to get stuck on?" with a short epic | `tool_used: Skill` matching `prd-simulator:simulate`, an unscored indicator in the with arm, and a `regex` for a punch list | The skill is invoked without being named, and the reply has a punch list |

All three prompts are fictional. The cases live in [`evals/`](../evals).

## Running the suite

Every run makes real model calls and is billed to your Claude account or API key. A case runs the full panel: one orchestrator, up to six seats and up to six skeptics, so one case costs a multiple of a single prompt. Start with one run per case and a cost ceiling:

```bash
claude plugin eval . --runs 1 --no-publish --max-cost-usd 15 --allow-tools Write
```

* `--allow-tools Write` lets the skill save its report. Without it, the skill's instructions say to print the report in chat instead.
* The graders read the last chat message, not the report file. With Write granted, that message is the short brief from step 5 of the skill, whose punch list gives one line per dev blocker with its owner, recommended default and the spec sentence it comes from, in quotes. Without Write, it is the full report. Either way the quoted spec lines and the punch list are in the text the graders read.
* By default the command also runs every case without the plugin, as a baseline, and reports the difference. Add `--ablation none` to skip the baseline runs and their cost.
* `--threshold` defaults to 1.0, so one imperfect case makes the command exit with 1.
* Results land in `evals/results/<timestamp>/`, which `.gitignore` keeps out of git.

The `evals` workflow in `.github/workflows/evals.yml` runs the same suite on GitHub when started by hand. It needs an `ANTHROPIC_API_KEY` repository secret, asks for a cost ceiling, never publishes the report, and uploads the results as a workflow artifact. It never runs on push or pull request.

## What the checks can and cannot tell you

* The `llm` graders are judged by a small model (Haiku unless `--judge-model` says otherwise). They are written to catch a missing punch list or generic advice. They are a weaker test of whether a finding truly matters.
* The tight-spec case is the one to watch. A simulator that always finds something is easy to build and useless in practice.
* One run per case is a smoke test, not a measurement. Model output varies between runs.
