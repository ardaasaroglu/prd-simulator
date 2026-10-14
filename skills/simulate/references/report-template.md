# Report template

Write the Pre-Handoff Simulation Report in exactly this shape. Replace everything in angle brackets. Keep the section order, even when a section is empty.

## Rules

* **Only dev blockers go in the first four sections.** They hold the findings the skeptic marked `dev_blocker`, sorted into sections by the finding's `type`: `blocker` into Blockers, `silent_assumption` into Silent assumptions, `missing_requirement` into Missing requirements, `integration_gap` into Integration gaps.
* **Number dev blockers 1, 2, 3 across all four sections**, highest severity first inside each section. The punch list uses the same numbers.
* **Dedupe.** Findings from several seats about the same decision are one item. List every seat under Raised by. Two or more seats on one item is a signal of importance, so keep them all. When merged findings differ in type, file the item under the first type in this order: `blocker`, `integration_gap`, `missing_requirement`, `silent_assumption`. Use the highest severity the skeptic gave any of them.
* **Quote, do not paraphrase.** A `spec_ref` that quotes the spec goes in a blockquote, word for word. A `spec_ref` that starts with `Missing:` goes on a `**Spec:**` line instead.
* **Mark unconfirmed items.** An item with `confidence: verify_with_engineering` gets the line `**Verify with engineering, not confirmed.**` right under its heading.
* **Empty sections say so.** Write `None surfaced.` under a dev blocker section or the scope section with no items, and `None.` under Dropped as noise when nothing was dropped.
* **Seat names** are written as: Backend, Frontend and mobile, Integrations, Data and analytics, Security and privacy, QA and release.

## Template

```markdown
# Pre-Handoff Simulation Report: <spec name>

* **Spec:** <file paths, comma separated, or "pasted text">
* **Date:** <YYYY-MM-DD>
* **Seats run:** <seat names, comma separated>
* **Run mode:** <parallel subagents | parallel, general-purpose fallback | sequential fallback>
* **Context files:** <paths, or "none">

## Summary

* **Dev blockers:** <n> (<n> high, <n> medium, <n> low)
* **Scope questions for the PM:** <n>
* **Dropped as noise:** <n>
* **Biggest risk:** <the one dev blocker that would cost the most to guess wrong, by number, and why, in one or two sentences>

## Blockers (resolve before handoff)

### <number>. <short title>

**Severity:** <high | medium | low>. **Owner:** <PM | Engineering | Design | External | Legal>. **Raised by:** <seat names>.

> "<spec sentence, word for word>"

* **Unclear:** <what_is_unclear>
* **Decision needed:** <decision_needed>
* **Options:** <option one>; <option two>; <option three>
* **Recommended default:** <recommended_default>

## Silent assumptions to confirm

<items, same shape, or "None surfaced.">

## Missing requirements (states and edge cases)

<items, same shape, or "None surfaced.">

## Integration gaps

<items, same shape, or "None surfaced.">

## Scope questions for the PM (not dev blockers)

### S<number>. <short title>

**Owner:** <owner>. **Raised by:** <seat names>.

> "<spec sentence, word for word>"

* **Question:** <decision_needed>
* **Recommended default:** <recommended_default>

## Dropped as noise

* **<finding id>, <short title>:** <reason>. <for an already answered finding: Answered by: "<spec sentence, word for word>">

## Punch list

Dev blockers only, in item order.

| Item | Owner | Recommended default | Severity |
|---|---|---|---|
| <number>. <short title> | <owner> | <recommended default, shortened> | <severity> |
```

## Two item shapes, for reference

An item that names a missing section instead of quoting:

```markdown
### 9. Cancelling a pending invite

**Severity:** medium. **Owner:** PM. **Raised by:** Frontend and mobile, Backend.

**Spec:** Missing: a way to cancel a pending invite.
```

An item that needs engineering to confirm it:

```markdown
### 12. The audit log may not exist yet

**Verify with engineering, not confirmed.**

**Severity:** medium. **Owner:** Engineering. **Raised by:** Security and privacy.

> "All role changes are recorded in the audit log."
```
