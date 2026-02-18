# Get Single Product API

## Endpoint
**GET** `/api/products/:id`

## Description
Retrieve details of a specific product by ID.

## Authentication
- Optional: Bearer token in Authorization header or user_token cookie
- Public endpoint - accessible without authentication

## Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

## Headers
- `Authorization: Bearer <token>` (optional - for authenticated users)

## Response
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": 1,
      "name": "Sample Product",
      "description": "Product description",
      "price": 99.99,
      "category": "Electronics",
      "brand": "Brand Name",
      "metadata": {},
      "images": ["/uploads/products/1/image.jpg"],
      "userId": 1,
      "status": "active",
      "isBoosted": false,
      "boostExpiresAt": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "profile_pic": "/uploads/profiles/avatar.jpg",
        "phone_number": "+1234567890"
      },
      "boostStatus": "none"
    }
  }
}
```

## Example Request
```
GET /api/products/1
```

## Error Responses

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Product not found"
}
```