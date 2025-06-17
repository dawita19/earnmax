## Authentication Endpoints

### POST /auth/register
```json
Request:
{
  "phone": "+251900000000",
  "email": "user@example.com",
  "password": "securePass123",
  "invite_code": "ABCDEF",
  "ip_address": "192.168.1.1"
}

Response:
{
  "user_id": 12345,
  "access_token": "eyJhbGci...",
  "vip_level": 0
}