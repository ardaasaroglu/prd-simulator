# Epic: Offline order history and refunds

*A fictional spec, written to show what prd-simulator does. Acme Market, its app and its numbers are invented.*

| | |
|---|---|
| Product | Acme Market, a grocery delivery app for iOS and Android |
| Team | Post-order team |
| Goal | Shoppers can check past orders without a connection, and report a problem with an order in the app instead of calling support. |

## Background

About 30% of app opens after a delivery happen in a kitchen or a building lobby with a weak connection. The Orders tab shows a spinner until it times out. Refund requests go through phone support today: about 11,000 calls a month, at an average of 6 minutes each.

## Out of scope

* Refunds to a payment method other than the one used for the order.
* Returns where a driver collects items.
* The web app.

## Stories

### Story 1: See recent orders offline

As a shopper, I can open the Orders tab without a connection and see my recent orders.

Acceptance criteria:

* Orders from the last 90 days are stored on the device.
* Offline, the Orders tab shows the stored orders with the banner "You're offline. Showing saved orders."
* When the connection returns, the list refreshes.

### Story 2: Order detail offline

As a shopper, I can open a stored order offline and see its items, quantities, prices, substitutions, delivery address and total.

Acceptance criteria:

* Every field above shows offline for any stored order.
* The receipt PDF can be downloaded online only. Offline, the Download receipt button is disabled.

### Story 3: Report a problem with items

As a shopper, I can select items from a delivered order, report each one as missing, damaged or wrong, and request a refund.

Acceptance criteria:

* Available for 48 hours after delivery.
* The shopper picks items and quantities, picks a reason for each item, and can attach up to 3 photos.
* The refund amount shown is the price paid for the selected items.
* Requests under $25 are approved automatically and refunded to the original payment method. Larger requests go to support for review.

### Story 4: Report a problem while offline

As a shopper with no connection, I can still submit a problem report, and it is sent when I am back online.

Acceptance criteria:

* The report is saved on the device and shows as "Waiting to send".
* It is sent automatically when the connection returns.

### Story 5: Refund status

As a shopper, I can see the status of my refund request on the order, and I get a push notification when it changes.

Acceptance criteria:

* Statuses: Submitted, In review, Approved, Refunded, Declined.
* A push notification is sent for Approved, Refunded and Declined.

### Story 6: Support review queue

As a support agent, I see refund requests that need review as tickets in our helpdesk, with the order, the items, the reasons and the photos, and I can approve or decline from the ticket.

Acceptance criteria:

* A request of $25 or more creates a ticket in the helpdesk, a third-party service Support already uses.
* Approving or declining in the helpdesk updates the request status in the app.

## Analytics

* Track `refund_requested`, `refund_auto_approved`, `refund_reviewed` and `offline_orders_viewed`.
* Success: phone calls about refunds fall by 50% within 3 months of launch.

## Dependencies

* The payments service already supports full refunds of an order.
* Helpdesk API: Support has an admin account.
