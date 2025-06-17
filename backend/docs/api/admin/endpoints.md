# Admin API Endpoints

## Authorization
All endpoints require `X-Admin-Token` header with JWT token

## Endpoints

### PATCH /admin/withdrawals/:id
```http
PATCH /admin/withdrawals/123 HTTP/1.1
Content-Type: application/json
X-Admin-Token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "status": "approved",
  "notes": "Payment verified via bank transfer"
}