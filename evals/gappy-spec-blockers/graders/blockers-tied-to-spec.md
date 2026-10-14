---
type: llm
---

PASS if the response names at least three gaps that would block or force a guess from a developer, and each of them is tied to a sentence of the spec, quoted or clearly named. At least two of these gaps must be among: what "custom" repeat means, month-end or time zone handling, what "Changes apply to future tasks" means for tasks already created, what happens when a recurring task is never completed, and who gets the next task when someone else in a shared project completes it. The response must also include a punch list that gives an owner and a recommended default for each item.

FAIL if the gaps are generic advice that would fit any spec, if no gap is tied to a spec sentence, or if there is no punch list.
