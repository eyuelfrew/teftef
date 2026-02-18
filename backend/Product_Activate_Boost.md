# Activate Boost for Product API

## Endpoint
**POST** `/api/products/:id/boost`

## Description
Submit a request to boost a product with a selected package.

## Authentication
- Required: Bearer token in Authorization header or user_token cookie
- User must be the owner of the product

## Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

## Headers
- `Authorization: Bearer <token>` (required)

## Request Body
```json
{
  "packageId": 1,
  "transactionId": "TXN123456789",
  "agentId": 1
}
```

## Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| packageId | integer | Yes | ID of the boost package |
| transactionId | string | Yes | Transaction ID for payment verification |
| agentId | integer | Yes | ID of the payment agent |

## Response
```json
{
  "status": "success",
  "message": "Boost request submitted successfully.",
  "data": {
    "boostRequest": {
      "id": 1,
      "productId": 1,
      "packageId": 1,
      "userId": 1,
      "transactionId": "TXN123456789",
      "agentId": 1,
      "bankName": "Bank Name",
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## Example Request
```
POST /api/products/1/boost
Authorization: Bearer <token>

{
  "packageId": 1,
  "transactionId": "TXN123456789",
  "agentId": 1
}
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

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Transaction ID is required"
}
```