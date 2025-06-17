# Authentication System Documentation

## Overview
JWT-based authentication with:
- Phone/email login
- Invitation code validation
- IP-based fraud detection
- Admin two-factor auth

## Flow
1. User submits credentials
2. System verifies against existing VIP0 users
3. JWT token issued upon success
4. Session maintained with refresh tokens

## Security
- Argon2 password hashing
- Rate limiting (10 attempts/hour)
- JWT expiration (1 hour access, 7 days refresh)