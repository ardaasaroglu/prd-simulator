---
max_turns: 40
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Agent, Write]
tags: [precision]
---

Simulate building this spec before handoff and tell me what would block engineering.

# Spec: Duplicate a card with a keyboard shortcut

Fictional product: Acme Boards web app.

## What exists today

Cards can already be duplicated from the card menu with the Duplicate action. That action calls the existing endpoint `POST /cards/{id}/duplicate`, which copies the title, description, labels, checklist and attachment links, places the copy directly below the original in the same column, and returns the new card. The endpoint already checks edit permission and returns 403 to viewers.

## Change

1. Add a keyboard shortcut that triggers the same existing Duplicate action: Ctrl+D on Windows and Linux, Cmd+D on macOS.
2. The shortcut works only when exactly one card has keyboard focus or is selected. It does nothing when no card or several cards are selected, or when focus is in a text field.
3. When the shortcut fires as described in 2, the browser's own Ctrl+D or Cmd+D (add bookmark) is prevented. In every other case the browser default is kept.
4. Behaviour is identical to the menu action: same endpoint, same placement of the copy, same permission check. A viewer sees the existing toast "You can't edit this board", the same one the menu shows.
5. While the request is in flight, further presses on the same card are ignored. On success, focus moves to the new card. On failure, the existing toast "Couldn't duplicate card. Try again." shows and focus stays on the original card.
6. The shortcut is listed in the existing Keyboard shortcuts dialog, opened with ?, under Cards, with the label "Duplicate card".
7. Analytics: the existing `card_duplicated` event gains a property `source` with the value `menu` or `shortcut`. No new events.
8. Ships behind the existing flag `keyboard_shortcuts_v2`, which already gates the other new shortcuts. Rollback is turning the flag off.

## Out of scope

Duplicating several cards at once, customising the shortcut, and mobile apps.
