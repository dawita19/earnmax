# Admin API Documentation

This documentation covers the administrative endpoints for managing:
- User withdrawal requests
- VIP purchase/upgrade approvals
- User suspensions
- System audits

**Authentication**:  
All endpoints require JWT authentication with admin privileges.

**Base URL**:  
`https://api.earnmaxelite.com/admin/v1`

**Rate Limiting**:  
- 100 requests/minute per admin
- Critical endpoints limited to 30 requests/minute