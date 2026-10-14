# Pre-Handoff Simulation Report: Offline order history and refunds

* **Spec:** examples/offline-order-history-and-refunds.md
* **Date:** 2026-10-14
* **Seats run:** Backend, Frontend and mobile, Integrations, Data and analytics, Security and privacy, QA and release
* **Run mode:** parallel subagents
* **Context files:** none

*Example report for a fictional spec. Real runs find and word things differently.*

## Summary

* **Dev blockers:** 12 (6 high, 5 medium, 1 low)
* **Scope questions for the PM:** 3
* **Dropped as noise:** 5
* **Biggest risk:** 1. Story 3 refunds selected items, but the only refund capability the spec names is a full refund of an order, so the core of the epic may not be buildable as written.

## Blockers (resolve before handoff)

### 1. Item refunds need partial refunds, the spec names only full refunds

**Verify with engineering, not confirmed.**

**Severity:** high. **Owner:** Engineering. **Raised by:** Backend, Integrations.

> "The payments service already supports full refunds of an order."

* **Unclear:** Story 3 refunds "the price paid for the selected items", which is a partial refund, and a shopper may report more than once per order. The dependency only promises full refunds.
* **Decision needed:** Does the payments service support partial refunds of an order, more than once per order?
* **Options:** It already does; it needs new work, planned before this epic; credit the shopper's account instead of refunding the card
* **Recommended default:** Confirm partial and repeated refunds before sizing Story 3. If they are missing, add them as a dependency with its own estimate.

## Silent assumptions to confirm

### 2. The $25 automatic approval: per request or per order, and how often

**Severity:** high. **Owner:** PM. **Raised by:** Backend, Security and privacy.

> "Requests under $25 are approved automatically and refunded to the original payment method."

* **Unclear:** A shopper could split a $60 claim into three requests of $20 and have all three approved automatically, or report the same item twice. Nothing limits how often one shopper can claim.
* **Decision needed:** Is the threshold per request or per order, can an item be claimed twice, and is there a cap per shopper?
* **Options:** Threshold per order, cumulative; per request, with one request per order; either of these plus a cap per shopper per 30 days
* **Recommended default:** Threshold per order, cumulative. Each item can be claimed once. A shopper's third automatic refund in 30 days goes to review.

### 3. The refund amount for discounted, substituted and taxed items

**Severity:** high. **Owner:** PM. **Raised by:** Backend.

> "The refund amount shown is the price paid for the selected items."

* **Unclear:** Orders carry promotions, multi-buy discounts, substitutions at a different price, tax and a delivery fee. "Price paid" can be computed several ways, and the shopper sees the number before submitting.
* **Decision needed:** How is the price paid for an item computed when the order has discounts, substitutions and tax?
* **Options:** Line price after item discounts plus its share of tax; line price before order-level promotions; the substitute's price when there was a substitution
* **Recommended default:** Line price after item and order discounts, spread by line value, plus tax. The delivery fee is never refunded.

### 4. Offline analytics: which time and when events count

**Severity:** low. **Owner:** Engineering. **Raised by:** Data and analytics.

> "Track `refund_requested`, `refund_auto_approved`, `refund_reviewed` and `offline_orders_viewed`."

* **Unclear:** `offline_orders_viewed` and offline reports happen without a connection. The spec does not say whether events are queued and sent later, and with which time.
* **Decision needed:** Are offline events queued and sent with the time they happened?
* **Options:** Queue them with the original time; drop events made offline
* **Recommended default:** Queue them with the original time and an `offline` property.

## Missing requirements (states and edge cases)

### 5. Duplicate sends from the offline queue

**Severity:** high. **Owner:** Engineering. **Raised by:** Backend, QA and release.

> "It is sent automatically when the connection returns."

* **Unclear:** Connections drop and return many times. A report can be sent, the reply lost, and the report sent again, which could create two refunds.
* **Decision needed:** How does the server recognise a report it has already received?
* **Options:** The device creates a report id and the server ignores repeats; the server rejects a second report for the same items
* **Recommended default:** The device creates the report id when the shopper submits, and the server treats a repeated id as the same report.

### 6. The 48-hour window when a report waits offline

**Severity:** medium. **Owner:** PM. **Raised by:** Backend, Frontend and mobile, QA and release.

> "Available for 48 hours after delivery."

* **Unclear:** A report saved offline at hour 47 may reach the server at hour 50. The device clock can be wrong, and an order stored before delivery has no delivery time on the device.
* **Decision needed:** Does the window close on the time the shopper submitted or the time the server received the report, and what does the app show for an order whose delivery it has not seen?
* **Options:** Submit time on the device, accepted up to 24 hours late; arrival time at the server
* **Recommended default:** Submit time on the device, accepted if it arrives within 24 hours after the window. Orders with no stored delivery time hide Report a problem while offline.

### 7. A refund that fails, and what Refunded means

**Severity:** medium. **Owner:** PM. **Raised by:** Backend, Integrations.

> "Statuses: Submitted, In review, Approved, Refunded, Declined."

* **Unclear:** A refund can fail at the payments service, for example on an expired card, and it can take days to settle. There is no status for failure, and Refunded could mean sent or settled.
* **Decision needed:** What status does a failed refund show, and when does a request become Refunded?
* **Options:** Add a Refund failed status with a support contact; keep Approved until the payments service confirms
* **Recommended default:** Refunded means the payments service accepted the refund. Add Refund failed, which also opens a ticket for support.

### 8. Personal data in the order cache on the device

**Severity:** medium. **Owner:** Engineering. **Raised by:** Security and privacy.

> "Orders from the last 90 days are stored on the device."

* **Unclear:** Ninety days of addresses and purchases sit on the phone. The spec does not say whether the cache is encrypted, or whether it is cleared on sign-out or when another account signs in.
* **Decision needed:** How is the cache protected, and when is it cleared?
* **Options:** Encrypted storage, cleared on sign-out; plain storage, cleared on sign-out
* **Recommended default:** The platform's encrypted storage, cleared on sign-out and on account switch.

### 9. Saved reports and photos waiting on the device

**Severity:** medium. **Owner:** Design. **Raised by:** Frontend and mobile.

> "The report is saved on the device and shows as "Waiting to send"."

* **Unclear:** A waiting report holds up to 3 photos. The spec does not say whether the shopper can edit or cancel it, or what happens to it on sign-out.
* **Decision needed:** Can a waiting report be edited or cancelled, and what happens to it if the shopper signs out?
* **Options:** Cancel only; edit and cancel; try to send it before sign-out completes
* **Recommended default:** Cancel only. On sign-out, warn that waiting reports will be deleted.

### 10. Where photos are stored and who can see them

**Severity:** medium. **Owner:** Engineering. **Raised by:** Security and privacy.

> "The shopper picks items and quantities, picks a reason for each item, and can attach up to 3 photos."

* **Unclear:** Photos taken in a kitchen can show faces and addresses. The spec does not say where photos are stored, who can open them, or how long they are kept.
* **Decision needed:** Where are photos stored, who can open them, and when are they deleted?
* **Options:** Private storage with short-lived links for support; copies uploaded into the helpdesk
* **Recommended default:** Private storage, short-lived links for support only, deleted 90 days after the request closes.

## Integration gaps

### 11. How a decision in the helpdesk gets back to the app

**Severity:** high. **Owner:** Engineering. **Raised by:** Integrations.

> "Approving or declining in the helpdesk updates the request status in the app."

* **Unclear:** The helpdesk has to tell us about the decision. The spec does not say whether that is a webhook, a ticket field we poll, or something else, nor how we verify that the call came from the helpdesk.
* **Decision needed:** Which helpdesk mechanism carries the decision, and how do we verify it and process it only once?
* **Options:** A signed webhook on a ticket field change; poll tickets every few minutes
* **Recommended default:** A signed webhook on a custom Decision field, processed once per ticket.

### 12. Helpdesk access, ticket fields and a test environment

**Severity:** high. **Owner:** Engineering. **Raised by:** Integrations, Security and privacy, QA and release.

> "Helpdesk API: Support has an admin account."

* **Unclear:** A person's admin login is not an integration credential. The spec does not name the API, the fields a ticket needs, the limits on attachments and calls, or a sandbox to test against.
* **Decision needed:** Which credential, ticket fields and test environment does the integration use?
* **Options:** A dedicated API token with the narrowest role; the vendor's sandbox account; a separate test area in the live account
* **Recommended default:** A dedicated API token, a written field mapping agreed with Support, and the vendor's sandbox for testing.

## Scope questions for the PM (not dev blockers)

### S1. No rollout plan or kill switch for automatic refunds

**Owner:** PM. **Raised by:** QA and release.

**Spec:** Missing: a rollout plan, feature flag and kill switch for automatic refunds.

* **Question:** The epic issues refunds with no person in the loop, but says nothing about a gradual rollout or how to stop automatic approval quickly. How does it roll out, and who can turn automatic approval off?
* **Recommended default:** Ship behind a flag, start with a small share of shoppers, and add a switch that sends every request to review.

### S2. Approval limits for support agents

**Owner:** PM. **Raised by:** Security and privacy.

> "I can approve or decline from the ticket."

* **Question:** Agents can approve any amount. Does a large refund need a second approver?
* **Recommended default:** Agree a limit with Support before launch.

### S3. Measuring phone calls about refunds

**Owner:** PM. **Raised by:** Data and analytics.

> "Success: phone calls about refunds fall by 50% within 3 months of launch."

* **Question:** The goal is measured in the phone system, not in app events. Who reports the baseline and the result?
* **Recommended default:** Support operations reports it monthly from the phone system.

## Dropped as noise

* **FE-3, Status when push notifications are turned off:** already answered. Answered by: "As a shopper, I can see the status of my refund request on the order, and I get a push notification when it changes."
* **FE-6, What the receipt button does offline:** already answered. Answered by: "Offline, the Download receipt button is disabled."
* **FE-4, Support approves only some of the items:** speculation. The spec defines approve or decline for the whole request.
* **FE-5, Screen reader announcement for the offline banner:** nit. A standard pattern settled during the build.
* **QA-4, A device without room for 90 days of orders:** speculation. Order data is small and the spec gives no reason to expect it.

## Punch list

Dev blockers only, in item order.

| Item | Owner | Recommended default | Severity |
|---|---|---|---|
| 1. Item refunds need partial refunds | Engineering | Confirm partial and repeated refunds before sizing Story 3 | high |
| 2. $25 automatic approval: per request or per order | PM | Per order, cumulative, each item once, third automatic refund in 30 days goes to review | high |
| 3. Refund amount with discounts, substitutions and tax | PM | Line price after discounts plus tax, no delivery fee | high |
| 4. Offline analytics time | Engineering | Queue with the original time and an offline property | low |
| 5. Duplicate sends from the offline queue | Engineering | Device-created report id, repeats ignored | high |
| 6. 48-hour window for reports waiting offline | PM | Device submit time, accepted up to 24 hours late | medium |
| 7. Failed refunds and the meaning of Refunded | PM | Refunded on acceptance, add Refund failed | medium |
| 8. Personal data in the device cache | Engineering | Encrypted storage, cleared on sign-out | medium |
| 9. Waiting reports and photos on the device | Design | Cancel only, warn on sign-out | medium |
| 10. Photo storage and access | Engineering | Private storage, short-lived links, deleted after 90 days | medium |
| 11. Helpdesk decision back to the app | Engineering | Signed webhook on a Decision field | high |
| 12. Helpdesk access, fields and sandbox | Engineering | Dedicated API token, agreed mapping, vendor sandbox | high |
