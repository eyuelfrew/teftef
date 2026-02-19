# Registration & Verification API Documentation

## Overview

The registration flow uses **phone number verification with OTP** and optional **email verification**. 

- **Phone verification**: Required to post products and use core features
- **Email verification**: Optional but recommended for account recovery and trust

---

## Authentication Methods

### 1. **Email/Phone + Password** (Traditional)
- Register with email, phone, and password
- Login with email OR phone + password
- Verify phone with OTP
- Verify email with OTP (optional)

### 2. **Social Login** (Google, Apple, etc.)
- Sync user from social provider
- No password required
- Phone verification still required for posting

---

## Registration Flow

```
┌─────────────────┐
│  1. Register    │ → POST /api/auth/register
└─────────────────┘
         ↓
┌─────────────────┐
│  2. OTP Sent    │ → Console log (or SMS in production)
└─────────────────┘
         ↓
┌─────────────────┐
│  3. Verify OTP  │ → POST /api/auth/verify-registration-otp
└─────────────────┘
         ↓
┌─────────────────┐
│  ✅ Complete    │ → User can now post products
└─────────────────┘
         ↓
┌─────────────────┐
│  4. Verify Email│ → POST /api/auth/request-email-verification (Optional)
└─────────────────┘
```

---

## Login Flow

```
┌─────────────────────────┐
│  Login with:            │
│  - Email + Password     │
│  - Phone + Password     │
│  - Social (Google, etc.)│
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  POST /api/auth/login   │
│  or                     │
│  POST /api/auth/sync-user│
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  ✅ Get access token    │
└─────────────────────────┘
```

---

## API Endpoints

### 1. **Login (Email/Phone + Password)**
**POST** `/api/auth/login`

Login with email or phone number and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**OR with phone:**
```json
{
  "phone_number": "+251912345678",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251912345678",
      "profile_pic": null,
      "is_phone_verified": true,
      "is_email_verified": false,
      "auth_provider": "email"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Missing credentials
{
  "status": "fail",
  "message": "Email or phone number is required"
}

// 401 - Invalid credentials
{
  "status": "fail",
  "message": "Invalid credentials. User not found."
}

// 401 - Wrong password
{
  "status": "fail",
  "message": "Invalid credentials. Incorrect password."
}

// 401 - Social login user
{
  "status": "fail",
  "message": "This account uses social login. Please sign in with your connected account."
}
```

---

### 2. **Register User**
**POST** `/api/auth/register`

Creates a new user account and sends OTP to phone number.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+251912345678",
  "password": "securepassword123"
}
```

**Validation Rules:**
- All fields are required
- Password must be at least 6 characters
- Email must be unique
- Phone number must be unique

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your phone number with the OTP sent.",
  "data": {
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "requires_phone_verification": true,
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251912345678",
      "is_phone_verified": false
    }
  }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{
  "status": "fail",
  "message": "First name, last name, email, phone number, and password are required"
}

// 400 - Email already exists
{
  "status": "fail",
  "message": "This email is already registered. Please login instead."
}

// 400 - Phone already exists
{
  "status": "fail",
  "message": "This phone number is already registered. Please login instead."
}
```

---

### 3. **Social Login (Sync User)**
**POST** `/api/auth/sync-user`

Syncs user from social provider (Google, Apple, etc.).

**Request Body:**
```json
{
  "email": "john@gmail.com",
  "display_name": "John Doe",
  "photo_url": "https://...",
  "phone_number": "+251912345678",
  "provider": "google",
  "id_token": "..."
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "email": "john@gmail.com",
      "first_name": "John",
      "last_name": "Doe",
      "photo_url": "https://...",
      "is_phone_verified": false
    }
  }
}
```

---

### 2. **Verify Registration OTP**
**POST** `/api/auth/verify-registration-otp`

Verifies the OTP and completes registration.

**Headers:**
```
Authorization: Bearer <access_token_from_register>
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Phone verified successfully. Registration complete!",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251912345678",
      "is_phone_verified": true
    }
  }
}
```

**Error Responses:**
```json
// 400 - OTP expired
{
  "status": "fail",
  "message": "OTP has expired. Please request a new one."
}

// 400 - Invalid OTP
{
  "status": "fail",
  "message": "Invalid OTP. Please try again."
}
```

---

### 3. **Resend Registration OTP**
**POST** `/api/auth/resend-registration-otp`

Resends OTP if the previous one expired or wasn't received.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP resent successfully. Please check your phone."
}
```

---

### 4. **Cancel Registration**
**POST** `/api/auth/cancel-registration`

Cancels registration and deletes unverified user account.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Registration cancelled successfully."
}
```

**Error Response:**
```json
// 400 - Phone already verified
{
  "status": "fail",
  "message": "Cannot cancel registration - phone is already verified. Please contact support to delete your account."
}
```

---

### 5. **Get Current User**
**GET** `/api/auth/me`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251912345678",
      "profile_pic": null,
      "is_phone_verified": true,
      "auth_provider": "email",
      "is_blocked": false,
      "status": "active",
      "createdAt": "2026-02-19T10:00:00.000Z"
    }
  }
}
```

---

## Email Verification (Optional)

Users can verify their email anytime after registration for added account security.

### 6. **Request Email Verification**
**POST** `/api/auth/request-email-verification`

Generates a verification token and sends it to the user's email.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Email verification link sent. Please check your email.",
  "data": {
    "verification_link": "http://localhost:5173/verify-email?token=abc123...",
    "token": "abc123..."
  }
}
```

**Error Responses:**
```json
// 400 - Email already verified
{
  "status": "fail",
  "message": "Email is already verified"
}
```

---

### 7. **Verify Email with Token**
**POST** `/api/auth/verify-email`

Verifies the email using the token from the verification link.

**Request Body:**
```json
{
  "token": "abc123..."
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Email verified successfully!",
  "data": {
    "is_email_verified": true
  }
}
```

**Error Responses:**
```json
// 400 - Invalid token
{
  "status": "fail",
  "message": "Invalid verification token"
}

// 400 - Token expired
{
  "status": "fail",
  "message": "Verification token has expired. Please request a new one."
}
```

---

### 8. **Resend Email Verification**
**POST** `/api/auth/resend-email-verification`

Resends the email verification link if the previous one expired.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Email verification link resent. Please check your email.",
  "data": {
    "verification_link": "http://localhost:5173/verify-email?token=xyz789...",
    "token": "xyz789..."
  }
}
```

---

## Frontend Implementation Guide

### Step 1: Registration Form
```javascript
// React example
const handleRegister = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phoneNumber,
      password: formData.password
    })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    // Store token and redirect to OTP verification page
    localStorage.setItem('access_token', data.data.access_token);
    navigate('/verify-otp');
  }
};
```

### Step 2: OTP Verification Page
```javascript
const handleVerifyOtp = async (otp) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/auth/verify-registration-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ otp })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    // Registration complete - redirect to home or dashboard
    navigate('/');
  }
};

const handleResendOtp = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/auth/resend-registration-otp', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Show success message
};
```

### Step 3: Protected Routes
After verification, users can access protected features:

```javascript
// Check if user is verified before allowing actions
const checkUserVerification = async () => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.data.user.is_phone_verified) {
    // Redirect to OTP verification
    navigate('/verify-otp');
  }
};
```

### Step 4: Email Verification (Optional - User Profile Settings)
```javascript
// Request email verification
const handleRequestEmailVerification = async () => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/auth/request-email-verification', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (data.status === 'success') {
    // Show success message
    alert('Verification link sent! Check your email.');
  }
};

// Verify email from link (on /verify-email page)
const handleVerifyEmail = async (token) => {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (data.status === 'success') {
    // Email verified - redirect to profile or home
    navigate('/profile?emailVerified=true');
  }
};

// Resend email verification
const handleResendEmailVerification = async () => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/api/auth/resend-email-verification', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Show success message
};
```

### User Profile - Verification Status UI
```javascript
// In profile/settings page
const ProfileSettings = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data.data.user);
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h2>Verification Status</h2>

      {/* Phone Verification */}
      <div>
        <span>Phone: {user?.is_phone_verified ? '✅ Verified' : '❌ Not Verified'}</span>
        {!user?.is_phone_verified && (
          <button onClick={handleRequestOtp}>Verify Phone</button>
        )}
      </div>

      {/* Email Verification */}
      <div>
        <span>Email: {user?.is_email_verified ? '✅ Verified' : '❌ Not Verified'}</span>
        {!user?.is_email_verified && (
          <button onClick={handleRequestEmailVerification}>Verify Email</button>
        )}
      </div>
    </div>
  );
};
```

---

## Security Notes

1. **OTP Expiry**: Phone OTPs expire after 10 minutes
2. **Email Token Expiry**: Email verification tokens expire after 24 hours
3. **Password Hashing**: Passwords are hashed with bcrypt (cost: 12)
4. **JWT Tokens**: 7-day expiry, stored in httpOnly cookies
5. **Rate Limiting**: API rate limiting is enabled on `/api/*` routes
6. **Phone Verification Required**: Users cannot post products without verified phone
7. **Email Verification Optional**: Recommended for account recovery and trust badges

---

## Testing with Console OTP

In development, OTP is logged to console:
```
[OTP] Registration verification code for +251912345678: 123456
```

Check your backend console to get the OTP for testing.

---

## Error Handling

All errors follow this format:
```json
{
  "status": "fail" | "error",
  "message": "Human-readable error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation, duplicate, etc.)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (phone not verified, account blocked)
- `404` - Not Found
- `500` - Server Error
