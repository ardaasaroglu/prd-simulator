# The simulation method

prd-simulator is one way to run a method you can also run by hand, or with any chat assistant. This page describes the method on its own, so you can use it without Claude Code.

## The idea

Before a PRD, an epic or a set of stories goes to engineering, simulate building it. Read the spec as the people who will build it tomorrow, and write down only the places where they would have to stop and ask, or guess and move on. Stay at the altitude of build decisions and contracts, never code.

It does not replace engineering review. It prepares it, so the review spends its time on decisions instead of discovering them.

## The four steps

### 1. Decompose (tech lead)

Split the spec into build units: endpoints, data model changes, screens and their states, integration calls, background jobs, state transitions and migrations. Tag each unit with the seats it touches. This is a map, not a review. Nothing is judged yet.

### 2. Seats (developer personas)

Six seats read the spec independently. Each has a card that says what it owns, what it asks before it can start, and what it leaves to others. The full cards are in [seat-cards.md](../skills/simulate/references/seat-cards.md).

| Seat | Owns |
|---|---|
| Backend | APIs and contracts, data model, state machines, idempotency, concurrency, partial failure and retry, migrations |
| Frontend and mobile | Every screen state (empty, loading, error, offline, pending, partial), validation, accessibility, error copy, perceived latency |
| Integrations | Third-party APIs and webhooks: auth, field mapping, rate limits, timeouts, retries, sandbox vs production, vendor failure modes |
| Data and analytics | Event and metric definitions, reporting, backfills, existing-data migration, retention, personal data in logs |
| Security and privacy | Authentication and authorization, roles and permissions, abuse and fraud vectors, personal data handling, audit trail, compliance hooks |
| QA and release | Edge cases, race conditions, double submit, test data, feature flags and rollout, rollback, observability and alerts, regression surface |

A seat logs a finding only when it would have to stop and ask, silently guess, handle a state or edge case the spec does not mention, or call an integration with a contract detail missing. No style nits, no praise, no restating the spec. Empty is a valid answer. Never manufacture findings.

Each finding has these fields:

| Field | Meaning |
|---|---|
| `id` | Seat prefix and number, such as `BE-1` |
| `type` | `blocker`, `silent_assumption`, `missing_requirement` or `integration_gap` |
| `spec_ref` | The spec sentence, quoted word for word, or `Missing: <section>` |
| `what_is_unclear` | One or two plain sentences |
| `decision_needed` | The question someone must answer |
| `options` | Two to four realistic answers |
| `recommended_default` | The smallest sensible answer that lets work start |
| `severity` | `high`, `medium` or `low` |
| `confidence` | `spec_gap` (provable from the text) or `verify_with_engineering` (a suspected conflict with the existing system, never asserted as fact) |
| `owner` | `PM`, `Engineering`, `Design`, `External` or `Legal` |

The exact rules and definitions are in [finding-schema.md](../skills/simulate/references/finding-schema.md).

### 3. Skeptic (independent and adversarial)

A skeptic re-reads the spec from scratch, without the build units or anyone's reasoning, and sorts every finding into one of three verdicts:

* **dev_blocker:** real, and it blocks building the specified work.
* **scope_question:** a real gap, but a PM scope or planning call rather than a dev blocker: an unscoped surface, a deferred capability, a missing story.
* **noise:** already answered (cite where), speculation, or a nit.

When in doubt, the skeptic chooses noise. It may correct severity and owner.

### 4. Synthesize the report

Write the Pre-Handoff Simulation Report: title, spec name, date and the seats that ran, then a Summary with dev blockers by severity, the number of scope questions and the single biggest risk. Then these sections, in order:

1. Blockers (resolve before handoff)
2. Silent assumptions to confirm
3. Missing requirements (states and edge cases)
4. Integration gaps
5. Scope questions for the PM (not dev blockers), or "None surfaced."
6. Dropped as noise, one line each with the reason
7. Punch list: dev blockers only, as a table of Item, Owner, Recommended default and Severity

Merge findings raised by several seats into one item and name every seat: overlap signals importance. Mark items that came from `verify_with_engineering` findings with "Verify with engineering, not confirmed." The full template is in [report-template.md](../skills/simulate/references/report-template.md).

## Running it without subagents

The plugin's skill launches each seat and each skeptic as a separate subagent, so no seat sees another's findings and the skeptic has no stake in them. Without subagents, run the same steps in one conversation:

1. Run the seats one after another. For each, adopt only that seat's card and write its findings before you move on.
2. Run the skeptic as a separate final pass. Re-read the spec from scratch and judge every finding as if someone else wrote it.
3. Synthesize the report.

A single conversation is less independent than separate contexts. If your assistant lets you, start the skeptic pass in a fresh conversation and paste in the spec and the findings.

### A prompt to start from

Paste this into any capable chat assistant, followed by your spec. Paste the seat cards and the finding schema from the two reference files after it for the full rules.

```text
Simulate building the spec below before it goes to engineering. Do not write code.

1. As the tech lead, list the build units (endpoints, data model changes, screens and states,
   integration calls, background jobs, state transitions, migrations) and the seats each touches.
2. Then, one seat at a time (Backend; Frontend and mobile; Integrations; Data and analytics;
   Security and privacy; QA and release), list only what would make that developer stop and ask,
   silently guess, handle an unmentioned state or edge case, or call an integration with a missing
   contract detail. Quote the spec sentence for each, or name the missing section. Give options,
   a recommended default, a severity (high, medium, low), and an owner. An empty seat is fine.
   Never invent findings.
3. Then act as an independent skeptic. Re-read the spec from scratch and mark every finding as
   dev_blocker, scope_question or noise (already answered, speculation or nit). When unsure, choose noise.
4. Write the report: summary with the biggest risk, then Blockers, Silent assumptions, Missing
   requirements, Integration gaps, Scope questions for the PM, Dropped as noise, and a punch list
   table of dev blockers only (Item, Owner, Recommended default, Severity).

SPEC:
```

## Where the method comes from

It was distilled from running pre-handoff spec reviews in practice, and it borrows from older ideas:

* **Pre-mortem.** Gary Klein, ["Performing a Project Premortem"](https://hbr.org/2007/09/performing-a-project-premortem), Harvard Business Review, 2007. A pre-mortem imagines a project has already failed and asks why. The simulation borrows the shift in point of view, from "is this good?" to "where does this break?", but stays at the level of one spec.
* **Three Amigos.** [Agile Alliance glossary](https://www.agilealliance.org/glossary/three-amigos/). Business, development and testing perspectives look at a story together before work starts. The seats widen that panel to six build perspectives.
* **Example Mapping.** Matt Wynne, ["Introducing Example Mapping"](https://cucumber.io/blog/bdd/example-mapping-introduction/), 2015. Example Mapping turns unknowns into explicit questions before a story is built. The finding schema does the same, with an owner and a default for each question.
* **INVEST.** Bill Wake, ["INVEST in Good Stories, and SMART Tasks"](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/), 2003. INVEST checks a story's shape. The simulation checks whether a developer could build it without guessing.
