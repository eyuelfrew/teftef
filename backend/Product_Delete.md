# Delete Product API

## Endpoint
**DELETE** `/api/products/:id`

## Description
Delete an existing product listing.

## Authentication
- Required: Bearer token in Authorization header or user_token cookie
- User must be the owner of the product or an admin

## Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

## Headers
- `Authorization: Bearer <token>` (required)

## Response
```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": {
    "id": 1
  }
}
```

## Example Request
```
DELETE /api/products/1
Authorization: Bearer <token>
```

## Error Responses

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Product not found"
}
```