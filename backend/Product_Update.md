# Update Product API

## Endpoint
**PATCH** `/api/products/:id`

## Description
Update an existing product listing.

## Authentication
- Required: Bearer token in Authorization header or user_token cookie
- User must be the owner of the product or an admin

## Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

## Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: multipart/form-data` (for image uploads)

## Form Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Product name |
| description | string | No | Product description |
| price | number | No | Product price |
| category | string | No | Product category |
| brand | string | No | Product brand |
| metadata | object | No | Additional product metadata (JSON string) |
| status | string | No | Product status (active/inactive) |
| images | file[] | No | Product images (multiple files allowed) |

## Response
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": 1,
      "name": "Updated Product",
      "description": "Updated description",
      "price": 89.99,
      "category": "Electronics",
      "brand": "Updated Brand",
      "metadata": {},
      "images": ["/uploads/products/1/image.jpg"],
      "userId": 1,
      "status": "active",
      "isBoosted": false,
      "boostExpiresAt": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
}
```

## Example Request
```
PATCH /api/products/1
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "Updated Laptop"
- price: 1199.99
- images: [new_image.jpg]
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