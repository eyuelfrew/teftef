# Get All Products API

## Endpoint
**GET** `/api/products`

## Description
Retrieve a paginated list of all products with optional search and filtering capabilities.

## Authentication
- Optional: Bearer token in Authorization header or user_token cookie
- Public endpoint - accessible without authentication

## Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search term to match against product names |
| category | string | No | Filter by specific category |
| minPrice | number | No | Minimum price filter |
| maxPrice | number | No | Maximum price filter |
| sort | string | No | Sorting option |
| page | number | No | Page number (default: 1) |
| limit | number | No | Number of results per page (default: 10) |

## Headers
- `Authorization: Bearer <token>` (optional - for authenticated users)

## Response
```json
{
  "status": "success",
  "results": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 45,
    "limit": 10
  },
  "data": {
    "products": [
      {
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
        }
      }
    ]
  }
}
```

## Example Request
```
GET /api/products?search=laptop&category=electronics&minPrice=100&maxPrice=1000&page=1&limit=10
```

## Error Responses
None - this is a public endpoint that returns empty results if no products match criteria.