# LinkConnect Product Overview

## Vision

Enable admins, faculty, and students to share, register, and track opportunities (links, submissions, logins) with auditability, rate controls, and clear role-based permissions.

## Roles & Capabilities

- **Admin**: Manage users (activate/deactivate, reset password, force logout), manage links, configure rate limits, view/export audit logs, view analytics, view visits by role, search user activity (logins/links/submissions), export data (users/links/submissions/logins), manage admin controls with audit trails.
- **Faculty**: Create and manage their own links; view faculty-scoped analytics (their links, submissions, login stats); monitor submissions per owned link; register/log in.
- **Student**: Register/log in, view assigned/available links, submit registrations, view their submission history.
- **Guest**: Visit landing/auth pages (tracked as visits), register new account.

## Core Features

- **Authentication & Sessions**: JWT auth with tokenVersion revocation; password reset by admin; login stats recorded; visit tracking by role.
- **User Management**: Admin CRUD-lite (toggle active, force logout, reset password), role filtering, search; export users CSV.
- **Link Management**: Admin toggle any link active/inactive; faculty manage own links; link listings with owner info and deadlines; export links CSV.
- **Submissions**: Track submissions per link; faculty visibility to their links’ submissions; export submissions CSV.
- **Analytics**: Totals for users/links/submissions; today/weekly logins; 7-day login chart; visit counts (total, by role); faculty-scoped stats for faculty dashboards.
- **Rate Limiting**: Admin-configurable limiter (window/max) persisted; immediate in-memory updates.
- **Auditing**: Admin audit logs with filters (action, actor, target user/link, date range) and CSV export.
- **User Activity Deep-Dive**: Admin search by name/email/roll; per-user rollup (logins, last login, links created, submissions, joined); recent login history table.
- **Exports**: Users, links, submissions, logins, audit logs (CSV).

## Goals

- Provide clear role-based access with strong admin controls and auditability.
- Deliver actionable analytics (global + role-scoped) and operational exports for reporting.
- Maintain platform stability with configurable rate limits and forced session revocation.
- Keep user journeys simple: quick login/registration, easy link discovery/submission, transparent admin oversight.

## Out-of-Scope (currently)

- Payment processing, notifications, SSO/OAuth, multi-tenant org separation, mobile apps.
