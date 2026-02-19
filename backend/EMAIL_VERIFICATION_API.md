# Email Verification API Documentation (OTP)

## Overview

Email verification uses **6-digit OTP** sent to the user's email. Users request an OTP, receive it via email, then enter it in the app to verify their email address.

**Perfect for Mobile Apps!** 📱

---

## Quick Summary

| Feature | Details |
|---------|---------|
| **OTP Format** | 6-digit code (e.g., `123456`) |
| **OTP Expiry** | 10 minutes |
| **Required** | No (optional but recommended) |
| **Auth Required** | Yes (user must be logged in) |

---

## API Endpoints

### 1. Request Email OTP

**POST** `/api/auth/request-email-verification`

Generates and sends a 6-digit OTP to the user's email.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent to your email. Please check your inbox.",
  "data": {
    "otp": "123456"  // Only in development mode
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

// 404 - User not found
{
  "status": "fail",
  "message": "User not found"
}
```

---

### 2. Verify Email with OTP

**POST** `/api/auth/verify-email`

Verifies the user's email using the OTP they entered.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
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
  "message": "Email verified successfully!",
  "data": {
    "is_email_verified": true
  }
}
```

**Error Responses:**
```json
// 400 - OTP required
{
  "status": "fail",
  "message": "OTP is required"
}

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

### 3. Resend Email OTP

**POST** `/api/auth/resend-email-verification`

Generates and sends a new OTP if the previous one expired.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP resent to your email.",
  "data": {
    "otp": "654321"  // Only in development mode
  }
}
```

---

## User Flow (Mobile App)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. User opens Profile/Settings                        │
│     └─→ Sees "Email: ❌ Not Verified"                  │
│                                                         │
│  2. User taps "Verify Email" button                    │
│     └─→ POST /api/auth/request-email-verification      │
│                                                         │
│  3. User receives email with 6-digit OTP               │
│     └─→ OTP valid for 10 minutes                       │
│                                                         │
│  4. User enters OTP in the app                         │
│     └─→ POST /api/auth/verify-email with OTP           │
│                                                         │
│  5. ✅ Email verified! Badge updates                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation (Mobile)

### React Native Example

#### 1. Email Verification Component

```jsx
// EmailVerificationScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

const EmailVerificationScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const requestOTP = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/auth/request-email-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email!');
        
        // In development, show OTP in alert for testing
        if (data.data.otp) {
          Alert.alert('Development OTP', data.data.otp);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'Email verified!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/auth/resend-email-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'OTP resent!');
        if (data.data.otp) {
          Alert.alert('Development OTP', data.data.otp);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Verify Email
      </Text>

      {!otpSent ? (
        <Button 
          title="Send OTP" 
          onPress={requestOTP} 
          disabled={loading}
        />
      ) : (
        <>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginBottom: 20,
              fontSize: 18,
              textAlign: 'center',
            }}
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <Button 
            title="Verify Email" 
            onPress={verifyOTP} 
            disabled={loading}
          />

          <View style={{ marginTop: 20 }}>
            <Button 
              title="Resend OTP" 
              onPress={resendOTP} 
              disabled={loading}
              color="#666"
            />
          </View>
        </>
      )}
    </View>
  );
};

export default EmailVerificationScreen;
```

---

#### 2. Profile Screen with Verification Status

```jsx
// ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Profile</Text>

      {/* Email Verification Status */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
      }}>
        <View>
          <Text style={{ fontWeight: '600' }}>Email Verification</Text>
          <Text style={{ color: user?.is_email_verified ? 'green' : 'red' }}>
            {user?.is_email_verified ? '✅ Verified' : '❌ Not Verified'}
          </Text>
        </View>

        {!user?.is_email_verified && (
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}
            onPress={() => navigation.navigate('EmailVerification')}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Phone Verification Status */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
      }}>
        <View>
          <Text style={{ fontWeight: '600' }}>Phone Verification</Text>
          <Text style={{ color: user?.is_phone_verified ? 'green' : 'red' }}>
            {user?.is_phone_verified ? '✅ Verified' : '❌ Not Verified'}
          </Text>
        </View>

        {!user?.is_phone_verified && (
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}
            onPress={() => navigation.navigate('PhoneVerification')}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;
```

---

## Testing

### cURL Commands

```bash
# Set your token
TOKEN="your_access_token_here"

# 1. Request email OTP
curl -X POST http://localhost:5000/api/auth/request-email-verification \
  -H "Authorization: Bearer $TOKEN"

# Check console for OTP (development mode)

# 2. Verify email with OTP
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'

# 3. Resend OTP (if needed)
curl -X POST http://localhost:5000/api/auth/resend-email-verification \
  -H "Authorization: Bearer $TOKEN"
```

---

## Email Template (Production)

When integrating with an email service, use this simple template:

### Subject: `Your Teftef Verification Code`

### HTML Body:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Email Verification Code</h1>
    
    <p>Your verification code is:</p>
    
    <div style="
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      margin: 20px 0;
      border-radius: 8px;
    ">
      {{otp}}
    </div>
    
    <p>This code will expire in <strong>10 minutes</strong>.</p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request this code, you can safely ignore this email.
    </p>
    
    <p style="margin-top: 30px;">
      Thanks,<br>
      The Teftef Team
    </p>
  </div>
</body>
</html>
```

### Plain Text:
```
Your Teftef verification code: {{otp}}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Thanks,
The Teftef Team
```

---

## Email Service Integration

### SendGrid Example

```javascript
// utils/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailOTP = async (email, otp) => {
  const msg = {
    to: email,
    from: 'noreply@teftef.com',
    subject: 'Your Teftef Verification Code',
    html: `
      <h1>Email Verification Code</h1>
      <p>Your verification code is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
    `
  };

  await sgMail.send(msg);
};

module.exports = { sendEmailOTP };
```

### Nodemailer (SMTP) Example

```javascript
// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmailOTP = async (email, otp) => {
  await transporter.sendMail({
    from: '"Teftef" <noreply@teftef.com>',
    to: email,
    subject: 'Your Verification Code',
    html: `
      <h1>Verification Code</h1>
      <p>Your code: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>Expires in 10 minutes.</p>
    `
  });
};

module.exports = { sendEmailOTP };
```

---

## Security Notes

1. **OTP Expiry**: 10 minutes
2. **OTP Format**: 6 digits (000000-999999)
3. **Rate Limiting**: API rate limiting enabled
4. **Single Use**: OTP cleared after successful verification
5. **Development Mode**: OTP logged to console (disabled in production)

---

## Environment Variables

```bash
# Email Service
SENDGRID_API_KEY=your_sendgrid_key
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# App Settings
NODE_ENV=development  # Change to 'production' in production
CLIENT_ORIGIN=https://yourapp.com
```

---

## API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/request-email-verification` | POST | Yes | Send 6-digit OTP to email |
| `/api/auth/verify-email` | POST | Yes | Verify email with OTP |
| `/api/auth/resend-email-verification` | POST | Yes | Resend OTP |

---

## Comparison: Phone vs Email Verification

| Feature | Phone OTP | Email OTP |
|---------|-----------|-----------|
| **Required** | Yes (for posting products) | No (optional) |
| **OTP Expiry** | 10 minutes | 10 minutes |
| **Format** | 6 digits | 6 digits |
| **Registration** | During signup | Anytime from profile |
| **Use Case** | Security, spam prevention | Trust badge, account recovery |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not received | Check spam folder, resend OTP |
| Invalid OTP | Ensure 6 digits, no spaces |
| OTP expired | Request new OTP (valid for 10 min) |
| Already verified | User already verified, no action needed |

---

## Support

For issues: support@teftef.com
