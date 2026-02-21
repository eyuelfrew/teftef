# 🔐 Refresh Token API Documentation

## Overview

The API now uses a **two-token system** for better security and user experience:

| Token Type | Lifetime | Purpose | Storage |
|------------|----------|---------|---------|
| **Access Token** | 15 minutes | API requests | Cookie + Response JSON |
| **Refresh Token** | 30 days (sliding) | Get new access tokens | HttpOnly Cookie + Database |

---

## 🔄 Sliding Window Mechanism

Every time a refresh token is used, its expiry is **extended by 30 days from that moment**:

```
Day 0:  User logs in → Token expires Day 30
Day 15: App calls /refresh → Token expires Day 45
Day 40: App calls /refresh → Token expires Day 70
...
User stays logged in indefinitely with active usage!
```

**Inactive users** (30+ days) are automatically logged out for security.

---

## 📍 New Endpoints

### **1. POST `/api/v1/auth/refresh`**
Refresh access token (public endpoint)

**Request:**
```http
POST /api/v1/auth/refresh
Cookie: refresh_token=<token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
}
```

**Cookies Set:**
- `user_token` (15 minutes)
- `refresh_token` (30 days, same token, extended in DB)

---

### **2. POST `/api/v1/auth/logout`**
Logout from current device

**Request:**
```http
POST /api/v1/auth/logout
Cookie: user_token, refresh_token
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### **3. POST `/api/v1/auth/logout-all`**
Logout from **all devices** (revoke all sessions)

**Request:**
```http
POST /api/v1/auth/logout-all
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out from all devices successfully"
}
```

---

### **4. GET `/api/v1/auth/sessions`**
Get active sessions (devices)

**Request:**
```http
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": 1,
        "device": "Chrome on Windows",
        "ip": "192.168.1.1",
        "created_at": "2024-01-01T10:00:00Z",
        "expires_at": "2024-01-31T10:00:00Z"
      }
    ]
  }
}
```

---

## 📱 Flutter Integration

### **1. Login Response**

```dart
// After successful login, you receive:
{
  "access_token": "eyJ...",  // Valid for 15 min
  "refresh_token": "abc..."  // Stored in httpOnly cookie
}
```

### **2. Auto-Refresh Token (Interceptor)**

```dart
class AuthInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;
  String? _newAccessToken;

  AuthInterceptor(this._dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        // Try to refresh
        final response = await _dio.post('/api/v1/auth/refresh');
        
        if (response.statusCode == 200) {
          final newToken = response.data['data']['access_token'];
          
          // Retry original request with new token
          final retryRequest = await _retryRequest(err.requestOptions, newToken);
          return handler.resolve(retryRequest);
        }
      } catch (e) {
        // Refresh failed - redirect to login
        print('Session expired, please login again');
      }
    }
    return handler.next(err);
  }

  Future<Response> _retryRequest(RequestOptions options, String token) {
    options.headers['Authorization'] = 'Bearer $token';
    return _dio.request(
      options.path,
      data: options.data,
      queryParameters: options.queryParameters,
      options: Options(
        method: options.method,
        headers: options.headers,
      ),
    );
  }
}
```

### **3. Logout**

```dart
// Logout from current device
await dio.post('/api/v1/auth/logout');

// OR logout from all devices
await dio.post('/api/v1/auth/logout-all');
```

### **4. View Active Sessions**

```dart
final response = await dio.get('/api/v1/auth/sessions');
final sessions = response.data['data']['sessions'];

for (var session in sessions) {
  print('Device: ${session['device']}');
  print('IP: ${session['ip']}');
  print('Expires: ${session['expires_at']}');
}
```

---

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **Token Hashing** | Refresh tokens are hashed (SHA-256) before DB storage |
| **HttpOnly Cookies** | Tokens inaccessible to JavaScript (XSS protection) |
| **Device Tracking** | Device info + IP stored for each session |
| **Soft Revocation** | Tokens marked as revoked (not deleted) for audit |
| **Auto Cleanup** | Expired tokens cleaned up every 24 hours |
| **Cascade Delete** | Tokens deleted when user is deleted |

---

## 🗄️ Database Schema

### **`refresh_tokens` Table**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT UNSIGNED | Primary key |
| `user_id` | INT UNSIGNED | Foreign key to users (indexed) |
| `token_hash` | VARCHAR(255) | SHA-256 hash (unique) |
| `expires_at` | DATETIME | Expiry (indexed) |
| `device_info` | VARCHAR(255) | Browser/device info |
| `ip_address` | VARCHAR(45) | IP when issued |
| `is_revoked` | BOOLEAN | Soft delete flag |
| `createdAt` | DATETIME | Token creation time |

**Indexes:**
- `idx_user_active_tokens` → (user_id, is_revoked)
- `idx_expired_tokens` → (expires_at) WHERE is_revoked = false

---

## 🎯 Best Practices

### **For Flutter App:**

1. **Store tokens in memory only** (cookies handle storage)
2. **Call `/refresh` before access token expires** (e.g., at 12 minutes)
3. **Handle 401 errors** → auto-refresh → retry request
4. **Show session list** → let users revoke suspicious devices
5. **Call `/logout-all`** on password change

### **For Backend:**

1. **Monitor failed refresh attempts** (potential attack)
2. **Rate limit `/refresh` endpoint** (prevent abuse)
3. **Log out from all devices** on sensitive operations
4. **Clean up expired tokens** (already scheduled every 24h)

---

## 🚨 Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `Refresh token required` | No refresh token in cookie |
| 401 | `Invalid or revoked refresh token` | Token not found or revoked |
| 401 | `Refresh token expired. Please login again.` | Token past expiry |
| 403 | `Your account has been blocked` | User is blocked |
| 403 | `Your account has been disabled` | User status not active |

---

## 📊 Comparison: Before vs After

| Aspect | Before (7-day token) | After (Refresh system) |
|--------|---------------------|----------------------|
| Access token lifetime | 7 days | 15 minutes |
| User stays logged in | 7 days | Indefinitely (active users) |
| Security risk | High (long-lived token) | Low (short-lived + hashed) |
| Multi-device support | ❌ No | ✅ Yes |
| Session management | ❌ No | ✅ View/revoke sessions |
| Token revocation | ❌ Impossible | ✅ Instant |

---

## ✅ Migration Notes

**Existing users** will need to login again (old tokens won't work with new system).

The database will automatically create the `refresh_tokens` table on next startup (Sequelize sync with `alter: true`).
