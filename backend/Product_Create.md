# Create Product API

## Endpoint
**POST** `/api/products`

## Description
Create a new product listing.

## Authentication
- Required: Bearer token in Authorization header or user_token cookie

## Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: multipart/form-data` (for image uploads)

## Form Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| price | number | Yes | Product price |
| category | string | Yes | Product category |
| brand | string | No | Product brand |
| metadata | object | No | Additional product metadata (JSON string) |
| images | file[] | No | Product images (multiple files allowed) |

## Response
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": 1,
      "name": "New Product",
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
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## Example Request
```
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "New Laptop"
- description: "High-performance laptop"
- price: 1299.99
- category: "Electronics"
- brand: "TechBrand"
- images: [file1.jpg, file2.jpg]
```

## Error Responses

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Authentication required"
}
```

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Validation error message"
}
```