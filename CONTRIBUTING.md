# Contributing

Small, focused changes are welcome. A few rules keep the simulator useful.

1. **A finding has to be earned.** A seat logs something only when it would stop, guess, meet an unmentioned state, or call an integration with a missing detail. Never change a prompt so the panel finds more for the sake of finding more. An empty seat is a good result.
2. **The skeptic stays independent.** It gets the spec, the context files and one seat's findings. Nothing else.
3. **One vocabulary.** Seat names, finding types (`blocker`, `silent_assumption`, `missing_requirement`, `integration_gap`), verdicts (`dev_blocker`, `scope_question`, `noise`) and report sections are shared with [docs/method.md](docs/method.md). Change them everywhere or nowhere.
4. **Shared text lives in two places on purpose.** Each seat card and each block of shared rules is written once in `skills/simulate/references/` and copied word for word into the agent files under `agents/`, because a subagent cannot read the skill's files on its own. Edit both copies. `npm test` fails when they drift.
5. **No pinned models.** Agents use `model: inherit`, and the skill sets no model.
6. **Examples are fictional.** Never add a real spec from a real company, even with the names changed.

Before opening a pull request:

* Run `npm test`. It needs Node 22 or newer and nothing else.
* Run `claude plugin validate . --strict`. CI runs both.
* Try the change for real: `claude --plugin-dir .`, then `/prd-simulator:simulate examples/team-invites-and-roles.md`. A prompt that parses is not a prompt that works.
* If you changed how findings are judged, consider running the eval suite. It makes real model calls and costs money, see [docs/evals.md](docs/evals.md).

Found a security problem? Follow [SECURITY.md](SECURITY.md) and do not open a public issue.
