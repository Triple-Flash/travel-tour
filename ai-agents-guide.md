# AI Agents Guide — Tour Booking System

## Overview

This document outlines the behavior, responsibilities, and business logic that AI agents must follow when operating within the tour booking system. It covers user identity rules, checkout automation, capacity management, and post-tour rating eligibility.

---

## 1. User Identity — Unique Phone Number Rule

### Rule

A **user is uniquely identified by their phone number**. The system must not allow duplicate accounts sharing the same phone number.

### Agent Behavior

- When a new user registers, the agent **must check** whether the phone number already exists in the system before creating an account.
- If the phone number is already registered, the agent **must reject** the registration and notify the user that the phone number is already in use.
- When counting users (e.g., for analytics, reporting, or capacity checks), the agent **must count distinct phone numbers only** — not account IDs or email addresses — to avoid inflating user counts.

### Validation Logic

```
IF phone_number EXISTS in users table THEN
  REJECT registration
  RETURN error: "This phone number is already associated with an account."
ELSE
  PROCEED with account creation
END IF
```

### Notes for Agents

- Do not treat the same phone number in different formats (e.g., `+84 912 345 678` vs `0912345678`) as different users. Normalize phone numbers to a canonical format (e.g., E.164) before comparison.
- Phone number is the **source of truth** for identity. Email or username may change; phone number uniquely identifies a user.

---

## 2. Checkout Page — Auto-populate Phone Number

### Rule

The checkout page **must automatically populate the phone number field** using the phone number stored in the authenticated user's profile. The user should not need to manually re-enter it.

### Agent Behavior

- When a user navigates to the checkout page, the agent **must retrieve** the phone number from the user's profile in the database.
- The phone number field **must be pre-filled** before the page renders.
- The user may be allowed to edit the field if they wish to use a different contact number for the booking, but the default value must be their registered phone number.

### Data Flow

```
User opens Checkout Page
  → Agent fetches user profile (authenticated session)
  → Agent extracts phone_number from profile
  → Agent pre-fills phone_number into checkout form field
  → Page renders with phone_number already populated
```

### Error Handling

- If the user's profile does not have a phone number on record, the agent must:
  1. Leave the field empty but **required**.
  2. Display a prompt: *"Please add a phone number to your profile or enter one below."*
  3. After a successful checkout, save the entered phone number back to the user's profile.

---

## 3. Tour Capacity — Decrease on Successful Payment

### Rule

When a user **successfully pays** for a tour, the tour's `max_capacity` must be **decreased by the number of customers in the order** (i.e., the `customer_count` field of the booking/order).

### Agent Behavior

- The capacity deduction **must only occur after payment is confirmed** (not at cart addition or checkout initiation).
- The agent must use the `customer_count` from the order — not a fixed value of 1 — to account for group bookings.
- If the capacity deduction would result in a negative value, the agent must **reject the payment** and notify the user that the tour is fully booked.

### Capacity Update Logic

```
ON payment_confirmed FOR order_id:
  order = fetch order by order_id
  tour  = fetch tour by order.tour_id

  remaining = tour.max_capacity - order.customer_count

  IF remaining < 0 THEN
    REJECT payment
    RETURN error: "Sorry, this tour no longer has enough spots available."
  ELSE
    UPDATE tour SET max_capacity = remaining
    CONFIRM booking
  END IF
```

### Concurrency Note

Because multiple users may book the same tour simultaneously, the capacity update **must use a transaction or optimistic lock** to prevent overselling. The check and the update must happen atomically.

### Reversal on Cancellation

- If a booking is cancelled and a refund is issued, the agent **must restore** the capacity:
  ```
  UPDATE tour SET max_capacity = max_capacity + order.customer_count
  ```

---

## 4. Post-Tour Rating — Eligibility Based on Tour Completion Date

### Rule

A user is only allowed to rate a tour **after the tour has been completed**. The completion date is calculated as:

```
completion_date = tour_start_date + tour_duration_days
```

The user becomes eligible to submit a rating **on or after** the `completion_date`.

### Example

| Field              | Value        |
|--------------------|--------------|
| Tour Duration      | 3 days       |
| Booking Date       | 11/06/2026   |
| Tour Start Date    | 11/06/2026   |
| Completion Date    | 14/06/2026   |
| Rating Allowed From| 14/06/2026   |

> The user booked a 3-day tour starting on **11 June 2026**. The tour ends on **14 June 2026**. The user may submit a rating **from 14 June 2026 onwards**.

### Agent Behavior

- When a user attempts to submit a rating, the agent **must check** whether `today >= completion_date`.
- If `today < completion_date`, the agent **must block** the rating submission and inform the user:
  > *"You can rate this tour from [completion_date]. Come back after you've completed the experience!"*
- If `today >= completion_date`, the agent **must allow** the rating submission.
- Each user may only rate a tour **once per booking**. Duplicate ratings for the same booking must be rejected.

### Rating Eligibility Logic

```
ON rate_tour REQUEST for booking_id:
  booking = fetch booking by booking_id
  tour    = fetch tour by booking.tour_id

  completion_date = booking.start_date + tour.duration_days

  IF today < completion_date THEN
    REJECT rating
    RETURN error: "Rating available from {completion_date}"
  ELSE IF rating already exists for this booking THEN
    REJECT rating
    RETURN error: "You have already rated this tour."
  ELSE
    ALLOW rating submission
  END IF
```

### Rating Window (Optional Enhancement)

Consider enforcing a **rating deadline** (e.g., ratings must be submitted within 30 days of the completion date) to prevent stale reviews from affecting tour scores.

```
rating_deadline = completion_date + 30 days

IF today > rating_deadline THEN
  REJECT rating
  RETURN error: "The rating period for this tour has closed."
END IF
```

---

## Summary Table

| # | Feature                        | Trigger                        | Agent Action                                                  |
|---|-------------------------------|-------------------------------|---------------------------------------------------------------|
| 1 | Unique user identity          | Registration                   | Reject duplicate phone numbers; count users by phone only    |
| 2 | Auto-fill phone at checkout   | Checkout page load             | Fetch phone from user profile and pre-populate the field      |
| 3 | Decrease tour capacity        | Successful payment confirmed   | Reduce `max_capacity` by `customer_count` from the order      |
| 4 | Enable tour rating            | User requests to rate a tour   | Allow only if `today >= start_date + duration_days`           |

---

## General Agent Guidelines

- **Always validate before acting.** Check preconditions (capacity, eligibility, duplicate data) before executing writes.
- **Fail gracefully.** Return clear, user-friendly error messages that explain what went wrong and what the user can do next.
- **Use atomic operations** for any action that reads and then writes shared state (e.g., capacity deduction).
- **Log all critical events** — successful payments, capacity changes, rating submissions, and rejections — for auditability.
