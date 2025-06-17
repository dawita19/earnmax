# Task Management System

## Overview
Handles daily VIP-level tasks including:
- Task generation (4 per VIP level)
- Completion tracking
- Earnings calculation
- Referral bonus distribution

## Key Features
- VIP-level specific tasks
- 24-hour task reset cron
- 4-level referral bonus cascade
- Anti-fraud measures (IP tracking, rate limiting)

## Data Flow
1. System generates tasks at 00:00 UTC
2. User completes tasks → triggers earnings
3. Earnings distributed to 4-level referrals
4. All actions logged for audit