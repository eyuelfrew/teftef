# User Boosting API Documentation

This guide explains how a regular user can boost their products on the platform.

---

## 🚀 The Boosting Process

1.  **Get Packages**: Find out which boost plans are available.
2.  **Get Payment Info**: Get the bank account details where to send the money.
3.  **Submit Request**: Send the proof of payment (transaction ID) to start the boost.

---

## 1. List Available Packages
Fetches all active boost plans that a user can purchase.

*   **URL**: `/api/v1/products/boost-packages`
*   **Method**: `GET`
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "packages": [
          {
            "id": 1,
            "name": "24 Hours Boost",
            "durationDays": 1,
            "price": "5.00"
          }
        ]
      }
    }
    ```

---

## 2. Get Payment Details
Fetches the bank account information required for the transfer.

*   **URL**: `/api/v1/products/bank-account`
*   **Method**: `GET`
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "bankAccount": {
          "id": 1,
          "name": "Teftef Official",
          "bankName": "Sample Bank",
          "accountNumber": "1234567890"
        }
      }
    }
    ```

---

## 3. Request Product Boost
Submits a boost request for a specific product after payment has been made.

*   **URL**: `/api/v1/products/:id/boost` // :id is the Product ID
*   **Method**: `POST`
*   **Auth Required**: Yes (Verified User)
*   **Request Body**:
    ```json
    {
      "packageId": 1,
      "transactionId": "TXN987654321"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "message": "Boost request submitted successfully.",
      "data": {
        "boostRequest": { ... }
      }
    }
    ```

---

## 4. My Boost History
View your own boost requests and their current status (pending, approved, rejected).

*   **URL**: `/api/v1/products/my-boosts`
*   **Method**: `GET`
*   **Auth Required**: Yes (Verified User)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "results": 2,
      "data": {
        "requests": [...]
      }
    }
    ```
