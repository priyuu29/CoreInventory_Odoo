# Authentication API Routes

## POST /api/auth/login
Authenticate user and return JWT token.

### Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response 200
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "avatar": "https://..."
  }
}
```

### Response 401
```json
{
  "error": "Invalid credentials"
}
```

---

## POST /api/auth/register
Register a new user.

### Request
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Response 201
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Response 422
```json
{
  "errors": {
    "email": ["Email already in use"]
  }
}
```

---

## POST /api/auth/logout
Logout user (invalidate token).

### Response 200
```json
{
  "message": "Logged out successfully"
}
```

---

## GET /api/auth/me
Get current authenticated user.

### Headers
```
Authorization: Bearer <token>
```

### Response 200
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "admin",
  "avatar": "https://..."
}
```
