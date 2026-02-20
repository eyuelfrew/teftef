# Admin Authentication API Documentation

**Base URL**: `http://localhost:5000/api/v1/admin/auth`

---

## 1. Admin Login
Authenticates an administrator and sets a secure `admin_token` cookie.

*   **URL**: `/login`
*   **Method**: `POST`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "admin@teftef.com",
      "password": "yourpassword"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "admin": {
          "id": 1,
          "email": "admin@teftef.com",
          "first_name": "Super",    
          "last_name": "Admin",
          "is_super_admin": true,
          "status": "active"
        }
      }
    }
    ```
*   **Note**: Sets a `httpOnly` cookie named `admin_token`.

---

## 2. Get Current Admin (Me)
Retrieves the profile of the currently logged-in administrator.

*   **URL**: `/me`
*   **Method**: `GET`
*   **Auth Required**: Yes (`admin_token` cookie)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "admin": {
          "id": 1,
          "email": "admin@teftef.com",
          "first_name": "Super",
          "last_name": "Admin",
          "is_super_admin": true
        }
      }
    }
    ```

---

## 3. Admin Logout
Clears the `admin_token` cookie and ends the session.

*   **URL**: `/logout`
*   **Method**: `POST`
*   **Auth Required**: No (Clears cookie regardless)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Logged out successfully"
    }
    ```

---

## 🛡️ Security Features
*   **Role Enforcement**: The `admin_token` contains a `role: "admin"` field. If a user tries to use their `user_token` on these endpoints, they will receive a `403 Forbidden` error.
*   **Cookie Security**: Cookies are flagged as `httpOnly` to prevent XSS attacks and `secure` in production (HTTPS).
*   **Super Admin**: Certain management routes (like creating other admins) require the `is_super_admin: true` flag in the token.
