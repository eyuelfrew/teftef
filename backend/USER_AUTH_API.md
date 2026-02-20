# User Authentication API Documentation

**Base URL**: `http://localhost:5000/api/v1/auth`

---

## 🚪 Public Endpoints

### 1. Register
Create a new user account.

*   **URL**: `/register`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+123456789",
      "password": "yourpassword"
    }
    ```

### 2. Login
Authenticate with email/phone and password. Sets `user_token` cookie.

*   **URL**: `/login`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "email": "john@example.com", // OR "phone_number": "+123456789"
      "password": "yourpassword"
    }
    ```

### 3. Social Sync (Login/Register)
Synchronize with external providers (Google, Apple, etc.).

*   **URL**: `/sync-user`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "email": "john@example.com",
      "display_name": "John Doe",
      "photo_url": "url",
      "phone_number": "+123456789", // Optional
      "provider": "google"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "user_id": 1,
        "access_token": "...",
        "requires_phone_verification": true, // If phone_number was provided for a new account
        "user": {
          "id": 1,
          "email": "john@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "phone_number": "+123456789",
          "profile_pic": "url",
          "is_phone_verified": false,
          "is_email_verified": false,
          "auth_provider": "google"
        }
      }
    }
    ```

## 🔐 Protected Endpoints (Requires `user_token`)

### 1. Get Profile (Me)
Retrieves the current user's profile.

*   **URL**: `/me`
*   **Method**: `GET`
*   **Success Response**: `200 OK`

### 2. Logout
Clears the `user_token` cookie.

*   **URL**: `/logout`
*   **Method**: `POST`
*   **Success Response**: `200 OK`

---

## 📱 Phone & Email Verification

### 1. Request OTP (Phone)
Sends a 6-digit verification code to the user's phone.

*   **URL**: `/request-otp`
*   **Method**: `POST`
*   **Body**: `{ "phone_number": "+123456789" }` (Optional if already on profile)

### 2. Verify OTP (Phone)
Verify the phone number with the received code.

*   **URL**: `/verify-otp`
*   **Method**: `POST`
*   **Body**: `{ "otp": "123456" }`

### 3. Email Verification
Users can add or update their email address and verify it.

*   **URL**: `/request-email-verification`
*   **Method**: `POST`
*   **Body**: `{ "email": "john@example.com" }` (Optional if already on profile)

*   **URL**: `/verify-email`
*   **Method**: `POST`
*   **Body**: `{ "otp": "123456" }`

---

## ⚙️ Security
*   **Namespacing**: User tokens **cannot** access `/api/v1/admin/` routes.
*   **Cookie**: Authentication is primarily handled via `httpOnly` secure cookies named `user_token`.
