# Pre-Handoff Simulation Report: Team invites and roles

* **Spec:** examples/team-invites-and-roles.md
* **Date:** 2026-10-14
* **Seats run:** Backend, Frontend and mobile, Integrations, Data and analytics, Security and privacy, QA and release
* **Run mode:** parallel subagents
* **Context files:** none

*Example report for a fictional spec. Real runs find and word things differently.*

## Summary

* **Dev blockers:** 13 (4 high, 7 medium, 2 low)
* **Scope questions for the PM:** 4
* **Dropped as noise:** 6
* **Biggest risk:** 2. Domain auto-join has no rule for who may claim a domain, so any admin could pull every new sign-up from another company, or from a public email provider, into their workspace. Items 3 and 4 were each raised by three seats, which marks them as the next to settle.

## Blockers (resolve before handoff)

### 1. The invite link has no role, expiry or off switch

**Severity:** high. **Owner:** PM. **Raised by:** Backend, Security and privacy.

> "Anyone with the link can join."

* **Unclear:** The spec does not say which role the link grants, whether it expires, whether an admin can revoke it, or whether joining by link uses a seat.
* **Decision needed:** Which role does a person who joins by link get, can the link be reset or expire, and does it respect the seat limit?
* **Options:** Link always grants Member, admin can reset it, never expires; admin picks the role when creating the link, link expires after 7 days; link grants Guest only
* **Recommended default:** Link grants Member, uses a seat, and an admin can reset it, which kills the old link. No expiry in this release.

### 2. Domain auto-join has no proof of domain ownership and no role

**Severity:** high. **Owner:** PM. **Raised by:** Security and privacy, Backend.

> "Admins can turn on auto-join for their company's email domain. Anyone who signs up with an email address at that domain joins the workspace automatically."

* **Unclear:** Nothing stops an admin from claiming a domain they do not own, or a public domain such as a free email provider. The role an auto-joined person gets is not stated. The open question in section 9 covers verifying each person's address, not the admin's claim to the domain.
* **Decision needed:** How does an admin prove they own a domain, which domains are blocked, and which role do auto-joined people get?
* **Options:** DNS record check before auto-join turns on; only the domain of the admin's own verified address, with public providers blocked; auto-join stays off until Security signs off
* **Recommended default:** Allow only the domain of the admin's own verified address, block public email providers, make auto-joined people Members, and require a verified address before joining.

### 3. The launch migration and the gradual rollout contradict each other

**Severity:** high. **Owner:** Engineering. **Raised by:** Backend, Data and analytics, QA and release.

> "On launch, every current member becomes a Member, and the person who created the workspace becomes its Owner."

* **Unclear:** The flag reaches 10% of workspaces first, but the migration runs "on launch". It is not clear whether roles are written for every workspace at once or per workspace when its flag turns on. Workspaces whose creator has deleted their account or left would get no Owner.
* **Decision needed:** When is each workspace migrated, and who becomes Owner when the creator is gone?
* **Options:** Migrate every workspace before the first flag step and keep roles dormant until the flag is on; migrate each workspace when its flag turns on; for a missing creator, make the longest-standing member the Owner, or leave it to support
* **Recommended default:** Migrate every workspace before the first flag step and keep roles dormant until the flag is on. Where the creator is gone, the longest-standing active member becomes Owner.

## Silent assumptions to confirm

### 4. What counts against the seat limit, and who wins the last seat

**Severity:** high. **Owner:** PM. **Raised by:** Backend, Frontend and mobile, QA and release.

> "Each plan has a seat limit. Owners, Admins and Members use a seat. Guests do not."

* **Unclear:** It is not said whether a pending invite holds a seat. Two people can accept the last seat at the same moment. An admin with 3 free seats can try to invite 10 people, and changing a Guest to a Member also takes a seat.
* **Decision needed:** Do pending invites hold seats, and what does each person see when the limit is reached part of the way through?
* **Options:** Pending invites hold a seat; seats are taken only on accept, and a late acceptor sees "This workspace is full"; sending is blocked beyond the free seats
* **Recommended default:** Seats are taken on accept. Sending is blocked when invites would exceed the free seats. A late acceptor sees a full-workspace page that tells them to ask an admin.

### 5. Accepting an invite while signed in with a different address

**Severity:** medium. **Owner:** PM. **Raised by:** Backend, Security and privacy.

> "If the address already belongs to an Acme Boards account, accepting adds the workspace to that account."

* **Unclear:** A person can open the invite while signed in to a different account, or forward the email to someone else. The spec does not say what happens when the signed-in account does not match the invited address.
* **Decision needed:** Must the accepting account's address match the invited address?
* **Options:** Must match, otherwise ask the person to switch accounts; any signed-in account can accept
* **Recommended default:** Must match. Otherwise the join page asks the person to sign in with the invited address.

### 6. How the invite acceptance rate is counted

**Severity:** medium. **Owner:** PM. **Raised by:** Data and analytics.

> "At least 60% of email invites are accepted within 7 days of sending."

* **Unclear:** The events in section 7 carry no invite id, method or role, so the rate cannot be computed from them. A resent invite could count once or twice, and revoked invites could stay in the denominator.
* **Decision needed:** What are the numerator and the denominator, and which properties do the events carry?
* **Options:** Count unique invited addresses and leave out revoked invites; count every send, resends included
* **Recommended default:** Unique invited addresses, revoked invites left out. Every event carries `invite_id`, `method` (email, link or domain) and `role`.

## Missing requirements (states and edge cases)

### 7. What "immediately" means for people who are online

**Verify with engineering, not confirmed.**

**Severity:** medium. **Owner:** Engineering. **Raised by:** Frontend and mobile, Security and privacy.

> "Removing a person ends their access immediately."

* **Unclear:** A person may be editing a board when they are removed or demoted to Guest. The spec does not say whether open sessions are cut off, or what that person sees. Whether the current session model can revoke access mid-session is not known from the spec.
* **Decision needed:** Are open sessions revoked at once, and what does a removed or demoted person see?
* **Options:** Revoke at once and show "Your access changed" with a reload; apply on the next page load
* **Recommended default:** Revoke at once. A removed person sees a "You no longer have access" page, and a demoted person's board reloads read-only.

### 8. Join page states beyond the happy path

**Severity:** medium. **Owner:** Design. **Raised by:** Frontend and mobile.

> "Error and empty states follow the design system defaults."

* **Unclear:** The defaults set the visual style, not the list of states. The join page needs copy and an action for an expired invite, a revoked invite, a person who is already a member, a full workspace and a signed-in account that does not match.
* **Decision needed:** Which join page states exist, and what does each one say and offer?
* **Options:** One generic "This invite no longer works" page; one page per state with its own next step
* **Recommended default:** One page per state, each with a single next step, such as "Ask your admin for a new invite".

### 9. What happens to a removed person's boards and guests

**Severity:** medium. **Owner:** PM. **Raised by:** Backend.

> "Removing a person ends their access immediately. Their boards stay in the workspace."

* **Unclear:** Members can invite Guests to boards they own, so a board needs an owner. After a removal, those boards have none, and the Guests on them stay.
* **Decision needed:** Who owns a removed person's boards, and do the Guests they invited keep access?
* **Options:** Ownership moves to the admin who removed them; ownership moves to the workspace Owner; Guests keep access; Guests lose access
* **Recommended default:** Ownership moves to the workspace Owner, and Guests keep access so shared work is not cut off.

### 10. Turning the flag off after roles are in use

**Severity:** medium. **Owner:** Engineering. **Raised by:** QA and release.

> "Behind the feature flag `team_roles_enabled`."

* **Unclear:** Once Guests, Admins and pending invites exist, switching the flag off has no defined result. Guests could suddenly see everything, or lose access entirely.
* **Decision needed:** What does a workspace look like when the flag goes off after launch?
* **Options:** Old behaviour returns and Guests lose access; roles stay enforced and only the new screens hide
* **Recommended default:** Roles stay enforced and only the new screens hide, so turning the flag off never widens access.

### 11. No limit on sending invites

**Severity:** medium. **Owner:** Engineering. **Raised by:** Security and privacy.

> "Admins enter one or more email addresses, up to 50 at a time, pick a role and press Send."

* **Unclear:** Anyone can create a workspace, become its admin, and send batches of 50 emails to any address from our domain. The spec sets a batch size but no rate.
* **Decision needed:** How many invites may a workspace send per day?
* **Options:** A daily cap per workspace; a cap only on free plans
* **Recommended default:** 200 invites per workspace per day, with a clear message when the cap is reached.

### 12. Some addresses in a batch fail

**Severity:** low. **Owner:** Design. **Raised by:** Backend, Frontend and mobile.

> "Admins enter one or more email addresses, up to 50 at a time, pick a role and press Send."

* **Unclear:** In a batch, some addresses may be malformed, already members or already invited.
* **Decision needed:** Does a batch fail as a whole, or send what it can and report the rest?
* **Options:** Reject the whole batch; send the valid ones and list the rest with reasons
* **Recommended default:** Send the valid ones and list each skipped address with its reason.

## Integration gaps

### 13. Bounced invite emails

**Severity:** low. **Owner:** Engineering. **Raised by:** Integrations.

> "Each address receives an email with a Join workspace button."

* **Unclear:** A mistyped address bounces, but the pending list would show it as pending until it expires.
* **Decision needed:** Do we read bounce events from the email provider and show them in the pending list?
* **Options:** Show "Could not deliver" in the pending list; ignore bounces in this release
* **Recommended default:** Show "Could not deliver" with Resend and Revoke, if the provider already reports bounces to us.

## Scope questions for the PM (not dev blockers)

### S1. Ownership transfer has no flow

**Owner:** PM. **Raised by:** Backend.

> "Everything an Admin can do, plus delete the workspace and transfer ownership. One per workspace."

* **Question:** The roles table gives the Owner a transfer power, but no requirement or design describes it. Does transfer ship in this release?
* **Recommended default:** Ship a minimal transfer from the member list, or take it out of the roles table for now.

### S2. Who can read the audit log, and for how long

**Owner:** PM. **Raised by:** Security and privacy.

> "Every invite, role change and removal is written to the audit log."

* **Question:** Entries are written, but no screen, export or retention rule exists. Is reading the audit log part of this release?
* **Recommended default:** Write entries now, add an admin view in a later release, and keep entries for one year.

### S3. How a Member invites a Guest

**Owner:** PM. **Raised by:** Frontend and mobile.

> "Invite Guests to boards they own."

* **Question:** The requirements and the Figma file cover only workspace invites. Is guest invitation part of this release, and from which screen?
* **Recommended default:** Reuse the email invite flow from the board's share menu.

### S4. How the trial and support metrics are measured

**Owner:** PM. **Raised by:** Data and analytics.

> "Enterprise trial to paid conversion rises from 18% to 25% in the two quarters after launch."

* **Question:** The conversion and offboarding ticket goals come from sources outside the product events. Who reports them, and from where?
* **Recommended default:** Name the report owner and the source before launch.

## Dropped as noise

* **SEC-7, Can an Admin demote another Admin:** already answered. Answered by: "Invite and remove people, change roles except Owner, manage workspace settings."
* **FE-7, What the invite form shows when the workspace is full:** already answered. Answered by: "When the workspace is full, the invite form shows "No seats left" with a link to upgrade."
* **INT-2, Which email provider sends invites:** nit. Sending through the product's existing email path is a choice engineering makes without rework.
* **QA-4, Time zone of the 7-day expiry:** nit. Seven days from sending is settled in minutes.
* **QA-5, Test domains for auto-join:** nit. A test data detail settled during the build.
* **FE-6, Pasting a comma-separated list of addresses:** nit. An input detail settled during the build.

## Punch list

Dev blockers only, in item order.

| Item | Owner | Recommended default | Severity |
|---|---|---|---|
| 1. Invite link has no role, expiry or off switch | PM | Grants Member, uses a seat, admin can reset it | high |
| 2. Domain auto-join has no proof of ownership and no role | PM | Admin's own verified domain only, public providers blocked, joins as Member | high |
| 3. Launch migration and gradual rollout contradict | Engineering | Migrate all before the first flag step; longest-standing member becomes Owner if the creator is gone | high |
| 4. What counts against seats, who wins the last seat | PM | Seats taken on accept, sending blocked beyond free seats | high |
| 5. Accepting while signed in with another address | PM | Must match the invited address | medium |
| 6. Invite acceptance rate definition | PM | Unique addresses, revoked left out, events carry invite_id, method, role | medium |
| 7. What "immediately" means for people online | Engineering | Revoke at once, read-only reload on demotion | medium |
| 8. Join page states | Design | One page per state with one next step | medium |
| 9. A removed person's boards and guests | PM | Boards move to the Owner, Guests keep access | medium |
| 10. Turning the flag off after launch | Engineering | Roles stay enforced, only screens hide | medium |
| 11. No limit on sending invites | Engineering | 200 invites per workspace per day | medium |
| 12. Some addresses in a batch fail | Design | Send valid ones, list the rest with reasons | low |
| 13. Bounced invite emails | Engineering | Show "Could not deliver" if bounces are already reported | low |
