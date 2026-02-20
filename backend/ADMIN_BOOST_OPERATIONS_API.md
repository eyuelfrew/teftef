# Admin Boost Operations API Documentation

These endpoints handle the lifecycle of a boost: from user request to active promotion and termination.

---

## 📋 Boost Requests (`/api/v1/admin/boost-requests`)

### 1. List Pending Requests
Fetches all boost requests that are waiting for approval.

*   **URL**: `/`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "results": 5,
      "data": {
        "requests": [...],
        "isHistory": false
      }
    }
    ```

### 2. List Request History
Fetches all processed (approved/rejected) boost requests.

*   **URL**: `/history`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "results": 20,
      "data": {
        "requests": [...],
        "isHistory": true
      }
    }
    ```

### 3. Verify (Approve/Reject) Request
Processes a pending boost request.

*   **URL**: `/:id/verify`
*   **Method**: `POST`
*   **Auth Required**: Yes (Admin)
*   **Request Body**:
    ```json
    {
      "status": "approved", 
      "startTime": "2024-02-20T10:00:00Z" // Optional: defaults to now
    }
    // OR
    {
      "status": "rejected",
      "rejectionReason": "Transaction ID not found"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Request approved and archived."
    }
    ```

---

## 🔥 Active Boosts (`/api/v1/admin/active-boosts`)

### 1. List All Active Boosts
Fetches products that are currently being promoted. Supports filtering.

*   **URL**: `/`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Query Params**:
    - `search`: Search by product name
    - `category`: Filter by category
    - `user`: Filter by user ID
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "results": 10,
      "data": {
        "activeBoosts": [...]
      }
    }
    ```

### 2. Terminate Boost
Immediately removes a product from the active boosts list.

*   **URL**: `/:id/terminate`  // :id is the Product ID
*   **Method**: `POST`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Boost terminated successfully"
    }
    ```

---

## 👤 User Intelligence
Helper endpoint to view user details related to a boost request.

*   **URL**: `/api/v1/admin/users/:id`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "phone_number": "+123456789",
          "profile_pic": "url",
          "createdAt": "..."
        }
      }
    }
    ```
