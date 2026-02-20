# Boost Package Management API Documentation

**Base URL**: `http://localhost:5000/api/v1/admin/boost-packages`

---

## 1. List All Packages
Fetches all boost packages, sorted by duration (short to long).

*   **URL**: `/`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "results": 3,
      "data": {
        "packages": [
          {
            "id": 1,
            "name": "24 Hours Boost",
            "durationDays": 1.0,
            "price": "5.00",
            "isEnabled": true
          }
        ]
      }
    }
    ```

---

## 2. Create New Package
Adds a new boost plan to the system.

*   **URL**: `/`
*   **Method**: `POST`
*   **Auth Required**: Yes (Admin)
*   **Request Body**:
    | Field | Type | Description |
    | :--- | :--- | :--- |
    | `name` | `String` | Display name (e.g., "7 Days Premium") |
    | `durationDays` | `Decimal` | Duration in days (e.g., `0.5` for 12 hours) |
    | `price` | `Decimal` | Cost of the package |
    | `isEnabled` | `Boolean` | (Optional) Defaults to `true` |

*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": {
        "package": {
          "id": 4,
          "name": "7 Days Premium",
          "durationDays": 7.0,
          "price": "30.00",
          "isEnabled": true
        }
      }
    }
    ```

---

## 3. Get Single Package
Retrieves details of a specific boost package.

*   **URL**: `/:id`
*   **Method**: `GET`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `200 OK`

---

## 4. Update Package
Modifies an existing boost plan.

*   **URL**: `/:id`
*   **Method**: `PATCH`
*   **Auth Required**: Yes (Admin)
*   **Request Body**: Any of the fields used in **Create**.
*   **Success Response**: `200 OK`

---

## 5. Delete Package
Permanently removes a boost plan.

*   **URL**: `/:id`
*   **Method**: `DELETE`
*   **Auth Required**: Yes (Admin)
*   **Success Response**: `204 No Content`
