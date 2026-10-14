---
max_turns: 40
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Agent, Write]
tags: [quality]
---

Simulate building this spec before it goes to engineering. Tell me what would block the developers, tie each blocker to the line of the spec it comes from, and finish with a punch list.

# PRD: Recurring tasks

Fictional product: Acme Tasks, a to-do app for small teams, on web and mobile.

## Requirements

* Users can make any task repeat.
* Repeat options: daily, weekly, monthly, or custom.
* When a recurring task is completed, the next one is created automatically.
* Users can edit a recurring task. Changes apply to future tasks.
* Reminders work the same as for normal tasks.
* In shared projects, recurring tasks are visible to everyone in the project.

## Analytics

* Track `task_recurring_created`.
