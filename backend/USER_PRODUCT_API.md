# User Product API Documentation

This guide documents the endpoints for managing products as a regular user.

**Base URL**: `http://localhost:5000/api/v1/products`

---

## 🛒 Product Management

### 1. List Products (Storefront)
Fetches a list of all active products with support for search and filtering.

*   **URL**: `/`
*   **Method**: `GET`
*   **Query Parameters**:
    *   `search`: Search by product name.
    *   `category`: Filter by category ID.
    *   `minPrice`: Minimum price.
    *   `maxPrice`: Maximum price.
    *   `limit`: Number of results per page (default: 10).
    *   `page`: Page number (default: 1).

### 2. Get Product Detail
Fetches full details of a specific product.

*   **URL**: `/:id`
*   **Method**: `GET`
*   **Auth**: Optional (Required if you want to see your own boost status for this product).

### 3. Create Product
Upload a new product. Requires `multipart/form-data`.

*   **URL**: `/`
*   **Method**: `POST`
*   **Auth**: Required (Verified User)
*   **Request Body (form-data)**:
    *   `name`: (String) Product name.
    *   `description`: (String) Detailed description.
    *   `price`: (Number) Sales price.
    *   `category`: (String/Path) Category path or ID.
    *   `brand`: (String) Brand name.
    *   `images`: (File[]) Up to 5 image files.
*   **Success Response**: `201 Created`

### 4. Update Product
Update an existing product. Only the owner or an admin can perform this.

*   **URL**: `/:id`
*   **Method**: `PATCH`
*   **Auth**: Required (Owner or Admin)
*   **Request Body (form-data)**: Same as Create (Submit only fields to update).

### 5. Delete Product
Permanently remove a product.

*   **URL**: `/:id`
*   **Method**: `DELETE`
*   **Auth**: Required (Owner or Admin)
*   **Success Response**: `204 No Content`

---

## 👤 User-Specific Views

### 1. My Products
List all products owned by the authenticated user, including their current boost status (active, pending, none).

*   **URL**: `/my-products`
*   **Method**: `GET`
*   **Auth**: Required (Verified User)

### 2. My Boost History
List all boost requests submitted by the user.

*   **URL**: `/my-boosts`
*   **Method**: `GET`
*   **Auth**: Required (Verified User)

---

## 🚀 Boosting
For endpoints related to boosting products (purchasing packages, submitting proof of payment), please refer to:
👉 **[USER_BOOST_API.md](file:///d:/my-projects/teftef/backend/USER_BOOST_API.md)**
