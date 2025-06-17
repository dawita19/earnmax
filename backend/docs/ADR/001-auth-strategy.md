# ADR 001: Authentication Strategy

## Status
Accepted

## Context
Need secure auth supporting:
- Phone/email login
- Invitation validation
- Admin 2FA

## Decision
Use JWT with:
- Argon2 for password hashing
- Short-lived access tokens
- Secure HTTP-only cookies for refresh