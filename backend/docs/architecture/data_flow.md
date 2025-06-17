## VIP Purchase Data Flow

1. Client submits purchase request
2. System validates available VIP levels
3. Request distributed to admin queue (round-robin)
4. Admin verifies payment proof
5. System:
   - Updates user VIP status
   - Calculates 4-level referral bonuses
   - Initializes daily earnings
6. Notification sent to user