# Get My Products API

## Endpoint
**GET** `/api/products/my-products`

## Description
Retrieve all products owned by the authenticated user.

## Authentication
- Required: Bearer token in Authorization header or user_token cookie

## Headers
- `Authorization: Bearer <token>` (required)

## Response
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "My Product",
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
        "boostStatus": "none"
      }
    ]
  }
}
```

## Example Request
```
GET /api/products/my-products
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