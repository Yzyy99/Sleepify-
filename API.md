# API Documentation

## Endpoints Overview

| Endpoint              | Method | Description                                     |
| --------------------- | ------ | ----------------------------------------------- |
| `/api/login/`         | POST   | Authenticates user and returns JWT tokens.      |
| `/api/token/refresh/` | POST   | Refreshes access token using the refresh token. |

---

## Detailed Endpoint Specifications

### 1. User Login

| **Field**  | **Type** | **Description**                                   | **Required** |
| ---------- | -------- | ------------------------------------------------- | ------------ |
| `username` | `string` | The user's username.(actually it is phone number) | Yes          |
| `password` | `string` | The user's password.                              | Yes          |

**Request Example**:
```json
{
    "username": "example_user",
    "password": "example_password"
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `refresh` | `string` | Refresh token.  |
| `access`  | `string` | Access token.   |

```json
{
    "refresh": "<refresh_token>",
    "access": "<access_token>"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Invalid username or password"
}
```

---

### 2. Token Refresh

| **Field** | **Type** | **Description**    | **Required** |
| --------- | -------- | ------------------ | ------------ |
| `refresh` | `string` | The refresh token. | Yes          |

**Request Example**:
```json
{
    "refresh": "<refresh_token>"
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description**   |
| --------- | -------- | ----------------- |
| `access`  | `string` | New access token. |

```json
{
    "access": "<new_access_token>"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Invalid or expired refresh token"
}
```

---

## Status Codes

| **Status Code** | **Description**                                     |
| --------------- | --------------------------------------------------- |
| `200`           | OK                                                  |
| `401`           | Unauthorized - Invalid credentials or expired token |
| `500`           | Internal Server Error                               |

