# Security Layers

1. **Authentication**
   - JWT with strict validation
   - IP-based session tracking
   - 2FA for admin endpoints

2. **Financial Security**
   - Dual approval for large transactions
   - Withdrawal amount validation
   - Daily reconciliation jobs

3. **Fraud Prevention**
   - Rate limiting (10 requests/min)
   - Device fingerprinting
   - Suspicious activity detection