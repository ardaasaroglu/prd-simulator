# PRD: Team invites and roles

*A fictional spec, written to show what prd-simulator does. Acme Boards, its team and its numbers are invented.*

| | |
|---|---|
| Product | Acme Boards, a web app where teams plan work on shared boards |
| Team | Workspace team |
| Status | Ready for engineering review |
| Target | Next quarter |

## 1. Problem

Every person in an Acme Boards workspace has the same powers today. Anyone can create, edit and delete any board, and the only way to add a colleague is to share the workspace URL in chat and ask them to sign up. Three of the last ten enterprise trials ended with "we cannot control who sees what". Support handles about 40 tickets a month asking us to remove a former employee from a workspace.

## 2. Goals

* Workspace admins can invite people by email and decide what each person may do.
* Enterprise trials get the roles they ask for.
* Offboarding a person no longer needs a support ticket.

Non-goals for this release: single sign-on and automated provisioning, per-board permissions beyond sharing a board with a guest, and any change to billing.

## 3. Success metrics

* At least 60% of email invites are accepted within 7 days of sending.
* Enterprise trial to paid conversion rises from 18% to 25% in the two quarters after launch.
* Offboarding tickets to support fall by 80%.

## 4. Roles

| Role | Can do |
|---|---|
| Owner | Everything an Admin can do, plus delete the workspace and transfer ownership. One per workspace. |
| Admin | Invite and remove people, change roles except Owner, manage workspace settings. |
| Member | Create, edit and delete boards they can see. Invite Guests to boards they own. |
| Guest | View and comment on boards shared with them. Cannot see the member list. |

## 5. Requirements

### 5.1 Invite by email

* Admins enter one or more email addresses, up to 50 at a time, pick a role and press Send.
* Each address receives an email with a Join workspace button. The invite expires after 7 days.
* If the address already belongs to an Acme Boards account, accepting adds the workspace to that account. Otherwise the person creates an account first and then lands in the workspace.
* Admins see a list of pending invites with Resend and Revoke actions.

### 5.2 Invite link

* Admins can create a shareable invite link for the workspace and copy it.
* Anyone with the link can join.

### 5.3 Domain auto-join

* Admins can turn on auto-join for their company's email domain. Anyone who signs up with an email address at that domain joins the workspace automatically.

### 5.4 Change role and remove

* Admins change a person's role from the member list. The change applies immediately.
* Removing a person ends their access immediately. Their boards stay in the workspace.

### 5.5 Seats

* Each plan has a seat limit. Owners, Admins and Members use a seat. Guests do not.
* When the workspace is full, the invite form shows "No seats left" with a link to upgrade.

### 5.6 Audit

* Every invite, role change and removal is written to the audit log.

### 5.7 Migration

* On launch, every current member becomes a Member, and the person who created the workspace becomes its Owner.

## 6. Design

Figma file "Invites v3" has the invite modal, the pending invites list, the member list and the join page. Error and empty states follow the design system defaults.

## 7. Analytics

Track `invite_sent`, `invite_accepted` and `role_changed`.

## 8. Rollout

Behind the feature flag `team_roles_enabled`. Our own workspace first, then 10% of workspaces for a week, then everyone.

## 9. Open questions

* Do we need to verify email addresses before auto-join? PM to confirm with Security.
