# User Auth Sync API

## Endpoint
**POST** `/api/auth/sync-user`

## Description
Synchronize a user after a successful Google/Firebase login on the mobile app. This endpoint will either create a new user or update an existing one based on their email.

## Headers
- `Content-Type: application/json`

## Body (JSON)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| display_name | string | No | User's full name (will be split into first and last name) |
| photo_url | string | No | URL to the user's profile picture |
| phone_number | string | No | User's phone number |
| provider | string | No | The auth provider (e.g., 'google', 'apple'). Defaults to 'google'. |
| id_token | string | No | The Firebase ID Token (for future server-side validation) |

## Response
```json
{
  "status": "success",
  "data": {
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "photo_url": "https://example.com/photo.jpg",
      "is_phone_verified": false
    }
  }
}
```

## Postman Test Example
1. Set method to **POST**.
2. URL: `{{base_url}}/api/auth/sync-user`
3. Body (Raw JSON):
```json
{
  "email": "testuser@example.com",
  "display_name": "Test User",
  "photo_url": "https://lh3.googleusercontent.com/a/image_url",
  "provider": "google"
}
```
4. Copy the `access_token` from the response to use in other protected requests (like creating a product).
