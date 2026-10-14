---
type: llm
---

The spec in the prompt is small and complete on purpose. Judge only the items the response presents as dev blockers, meaning items that would stop a developer or force a guess. Scope questions, items dropped as noise, and optional suggestions do not count.

PASS if the response reports no dev blockers, or exactly one dev blocker and it is marked low severity or described as minor.

FAIL if the response reports two or more dev blockers, or any dev blocker marked medium or high severity.
