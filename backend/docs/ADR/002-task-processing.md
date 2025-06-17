# ADR 002: Daily Task Processing

## Status
Implemented

## Context
Need to:
- Reset tasks every 24h
- Prevent cheating
- Calculate referral bonuses

## Solution
```typescript
class TaskService {
  async resetDailyTasks() {
    // 1. Archive completed tasks
    // 2. Generate new tasks based on VIP level
    // 3. Validate device/IP patterns
    // 4. Initialize referral tracking
  }
}