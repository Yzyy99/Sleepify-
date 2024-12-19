# API Documentation

## Endpoints Overview

| Endpoint                       | Method | Description                                     |
| ------------------------------ | ------ | ----------------------------------------------- |
| `/api/register/`               | POST   | Register new user
| `/api/login/`                  | POST   | Authenticates user and returns JWT tokens.      |
| `/api/token/refresh/`          | POST   | Refreshes access token using the refresh token. |
| `/api/send_verification_code/` | POST   | Send temporary code.                            |
| `/api/verify-code/`            | POST   | Verify the code and token and login.            |
| `/api/logout/`                 | POST   | Logout                                          |
| `/api/forum/posts/`          | POST    | Retrieve forum posts.                           |
| `/api/forum/get_picture/`    | POST    | Retrieve a picture from a forum post.           |
| `/api/forum/create_post/`    | POST   | Create a new forum post.                        |
| `/api/forum/create_picture/` | POST   | Upload a picture for a forum post.              |
| `/api/forum/like_post/`      | POST   | Like or unlike a forum post.                    |
| `/api/forum/reply_post/`     | POST   | Reply to a forum post.                          |
| `/api/forum/delete_post/`    | POST | Delete a forum post.                            |
| `/api/user/`    | PUT/GET/DELETE | User Profile.                            |

---

## Detailed Endpoint Specifications

### 1. User Rigester
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

**Response Example (201 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `massage` | `string` | successful message.  |

```json
{
    "message": "Registration successful"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Phone number and password are required"
}
```

```json
{
    "error": "Phone number is already registered"
}
```

### 2. User Login

| **Field**      | **Type** | **Description**          | **Required** |
| -------------- | -------- | ------------------------ | ------------ |
| `phone_number` | `string` | The user's phone number. | Yes          |
| `password`     | `string` | The user's password.     | Yes          |

**Request Example**:
```json
{
    "phone_number": "example_number",
    "password": "example_password"
}
```

**Response Example (200 CREATED)**:

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

**Error Response (400 BAD_REQUEST)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Invalid username or password"
}
```

---

### 3. Token Refresh

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
### 3. Send SMS Code

| **Field**      | **Type** | **Description**   | **Required** |
| -------------- | -------- | ----------------- | ------------ |
| `phone_number` | `string` | The Phone Number. | Yes          |

**Request Example**:
```json
{
    "phone_number": "<phone_number>"
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description**                       |
| --------- | -------- | ------------------------------------- |
| `token`   | `string` | Temp token for specific phone number. |

```json
{
    "token": "<token>",
    "message": "Verification code sent successfully."
}
```

**Error Response (400 Bad request)**:

| **Field** | **Type** | **Description**                                  |
| --------- | -------- | ------------------------------------------------ |
| `error`   | `string` | if phone number is invalid OR it already exists. |
```json
{
    "error": "Phone number is required."
}
```
**Error Response (409 Conflict)**:

| **Field** | **Type** | **Description**                                  |
| --------- | -------- | ------------------------------------------------ |
| `error`   | `string` | if phone number is invalid OR it already exists. |

```json
{
    "error": "User with this phone number already exists."
}
```
**Error Response (429 Too many requests)**:

| **Field** | **Type** | **Description**          |
| --------- | -------- | ------------------------ |
| `error`   | `string` | if post again in 60 sec. |

```json
{
    "error": "Please wait before requesting another code."
}
```
---
### 4. Verify SMS Code and Register 

| **Field**  | **Type** | **Description**                      | **Required** |
| ---------- | -------- | ------------------------------------ | ------------ |
| `token`    | `string` | The Token generated By Phone Number. | Yes          |
| `code`     | `string` | The SMS Code.                        | Yes          |
| `password` | `string` | The Register Password.               | Yes          |

**Request Example**:
```json
{
    "token": "<token>",
    "code": "<code>",
    "password": "<password>"
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description**                       |
| --------- | -------- | ------------------------------------- |
| `refresh` | `string` | Refresh token.  |
| `access`  | `string` | Access token.   |

```json
{
    "refresh": "<refresh_token>",
    "access": "<access_token>"
}
```

**Error Response (400 Bad request)**:

| **Field** | **Type** | **Description**                                          |
| --------- | -------- | -------------------------------------------------------- |
| `error`   | `string` | if token expired OR token is invalid OR code is invalid. |

```json
{
    "error": "The token has expired."
}
```
```json
{
    "error": "Invalid or expired verification code."
}
```
```json
{
    "error": "Invalid token."
}
```
### 5. Logout 

| **Field**       | **Type** | **Description** | **Required** |
| --------------- | -------- | --------------- | ------------ |
| `Authorization` | `String` | token           | Yes          |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>"
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description**                       |
| --------- | -------- | ------------------------------------- |
| `message` | `string` | Success. |

```json
{
    "message": "Successfully logged out."
}
```

**Error Response (400 Bad request)**:

| **Field** | **Type** | **Description**                            |
| --------- | -------- | ------------------------------------------ |
| `error`   | `string` | if token not provided OR token is invalid. |

```json
{
    "error": "Refresh token is required."
}
```
```json
{
    "error": "Invalid token."
}
```

### 6. Get Forum Posts

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `last_post_id` | `integer` | ID of the last post retrieved (for pagination). If null, response the latest 10. | No |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "last_post_id": 10
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `posts`   | `array`  | List of forum posts. |

```json
{
    "posts": [
        {
            "postid": 1,
            "username": "user1",
            "content": "This is a forum post.",
            "created_at": "2023-10-01T12:34:56Z",
            "picture_count": 2,
            "likes": 5,
            "replies": 1,
            "reply_content": [
                {
                    "reply_id": 1,
                    "username": "user3",
                    "content": "This is a reply."
                }
            ],
            "isliked": true
        },
        {
            "postid": 2,
            "username": "user2",
            "content": "This is another forum post.",
            "created_at": "2023-10-02T14:56:78Z",
            "picture_count": 0,
            "likes": 3,
            "replies": 0,
            "reply_content": [],
            "isliked": false
        }
    ]
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

### 7. Get Forum Picture

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `postid` | `integer` | ID of the forum post. | Yes |
| `picture_index` | `integer` | Index of the picture in the post. | Yes |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "postid": 1,
    "picture_index": 0
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `image`   | `string` | Base64 encoded image. |

```json
{
    "image": "<base64_encoded_image>"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

**Error Response (404 Not Found)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Picture not found"
}
```

**Error Response (500 Internal Server Error)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "<error_message>"
}
```

### 8. Create Forum Post

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `content` | `string` | Content of the forum post. | Yes |
| `picture_count` | `integer` | Number of pictures in the post. | No |
| `picture_names` | `array` | List of filenames for the pictures. | No |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "content": "This is a new forum post.",
    "picture_count": 2,
    "picture_names": ["{hashvalue}-2024-01-01T12:34:56Z.jpg", "{hashvalue}-2024-01-01T12:35:56Z.jpg"]
}
```

**Response Example (201 Created)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `postid`  | `integer` | ID of the created post. |
| `created_at` | `string` | Timestamp of post creation. |

```json
{
    "postid": 1,
    "created_at": "2023-10-03T12:34:56Z"
}
```

**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Content is required"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

### 9. Create Forum Picture

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `image_type` | `string` | Type of the image (e.g., jpg, png). | Yes |
| `image_data` | `string` | Base64 encoded image data. (no more than 5MB) | Yes |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "image_type": "jpg",
    "image_data": "<base64_encoded_image_data>"
}
```

**Response Example (201 Created)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `filename`     | `string` | filename of the uploaded image. |

```json
{
    "filename": "<image_hash>-<timestamp>.jpg"
}
```

**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Image type is required"
}
```
```json
{
    "error": "Image data is required"
}
```
```json
{
    "error": "Invalid base64 data"
}
```
```json
{
    "error": "Image size exceeds 5MB"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

### 10. Like Forum Post

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `postid` | `integer` | ID of the forum post to like/unlike. | Yes |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "postid": 1
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `likes`   | `integer` | Total number of likes for the post. |
| `isliked` | `boolean` | Whether the post is liked by the user. |

```json
{
    "likes": 10,
    "isliked": true
}
```

### 11. Reply to Forum Post

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `postid` | `integer` | ID of the forum post to reply to. | Yes |
| `reply_content` | `string` | Content of the reply. | Yes |

**Request Example**:

```json
{
    "Authorization": "Bearer <access_token>",
    "postid": 1,
    "reply_content": "This is a reply to the forum post."
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `replies` | `integer`| Total number of replies. |
| `reply_content` | `array`  | List of replies to the forum post. |

```json
{
    "replies": [
        {
            "reply_id": 1,
            "username": "user3",
            "content": "This is a reply."
        },
        {
            "reply_id": 2,
            "username": "user4",
            "content": "This is your new reply."
        }
    ]
}
```

**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Postid is required"
}
```
```json
{
    "error": "Reply content is required"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

**Error Response (404 Not Found)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Post not found"
}
```

**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Postid is required"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Access token is required"
}
```

**Error Response (404 Not Found)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Post not found"
}
```

### 12. Delete Forum Post

| **Field** | **Type** | **Description** | **Required** |
| --------- | -------- | --------------- | ------------ |
| `Authorization` | `string` | Access token for authentication. | Yes |
| `postid` | `integer` | ID of the forum post to delete. | Yes |

**Request Example**:
```json
{
    "Authorization": "Bearer <access_token>",
    "postid": 1
}
```

**Response Example (200 OK)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `message` | `string` | Success message. |

```json
{
    "message": "Post deleted successfully"
}
```

**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Postid is required"
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "User is not authenticated"
}
```

**Error Response (403 Forbidden)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "You do not have permission to delete this post"
}
```

**Error Response (404 Not Found)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Post not found"
}
```

### 13. Get Sleep Records
| **Field**      | **Type**   | **Description**                  | **Required** |
| -------------- | ---------- | -------------------------------- | ------------ |
| `Authorization`| `string`   | Access token for authentication. | Yes          |

**Request Example**:

```http
GET /api/sleep-records/
Authorization: Bearer <access_token>
```

**Response Example(200 OK)**:

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `id`             | `integer`  | Unique ID of the sleep record.              |
| `date`           | `string`   | Date of the sleep record (YYYY-MM-DD).      |
| `sleep_status`   | `string`   | Sleep status (e.g., "按时睡觉").            |
| `note`           | `string`   | Notes related to the sleep record.          |
| `created_at`     | `string`   | Timestamp when the record was created.      |
```json
[
    {
        "id": 1,
        "date": "2024-10-19",
        "sleep_status": "按时睡觉",
        "note": "无",
        "created_at": "2024-10-19T22:00:00Z"
    },
    {
        "id": 2,
        "date": "2024-10-20",
        "sleep_status": "熬夜",
        "note": "赶周末ddl",
        "created_at": "2024-10-20T22:00:00Z"
    }
]
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "User is not authenticated"
}
```

### 14. Create Sleep Record
| **Field**        | **Type**   | **Description**                       | **Required** |
| ----------------- | ---------- | ------------------------------------- | ------------ |
| `Authorization`   | `string`   | Access token for authentication.      | Yes          |
| `date`            | `string`   | Date of the sleep record (YYYY-MM-DD).| Yes          |
| `sleep_status`    | `string`   | Sleep status (e.g., "按时睡觉").       | Yes          |
| `note`            | `string`   | Notes related to the sleep record.    | Yes          |

**Request Example:**
```http
POST /api/sleep-records/
Authorization: Bearer <access_token>

{
    "date": "2024-12-03",
    "sleep_status": "按时睡觉",
    "note": "感觉很好"
}
```

**Response Example (201 Created):**

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `id`             | `integer`  | Unique ID of the created record.            |
| `date`           | `string`   | Date of the sleep record.                   |
| `sleep_status`   | `string`   | Sleep status.                               |
| `note`           | `string`   | Notes related to the sleep record.          |
| `created_at`     | `string`   | Timestamp when the record was created.      |

```json
{
    "id": 3,
    "date": "2024-12-03",
    "sleep_status": "按时睡觉",
    "note": "感觉很好",
    "created_at": "2024-12-03T22:00:00Z"
}
```
**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `object` | Validation error details.  |

```json
{
    "errors": {
        "date": ["This field is required."],
        "sleep_status": ["This field is required."]
    }
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "User is not authenticated"
}
```

---
### 15. Delete Sleep Record
| **Field**        | **Type**   | **Description**                       | **Required** |
| ----------------- | ---------- | ------------------------------------- | ------------ |
| `Authorization`   | `string`   | Access token for authentication.      | Yes          |
| `id`            | `int`   | Id of Sleep Record| Yes          |

**Request Example:**
```http
DELETE /api/sleep-records/
Authorization: Bearer <access_token>

{
    "id": <id>
}
```

**Response Example (200 OK):**

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `message`             | `string`  | Message meaning record deleted            |

```json
{
    "message": "Record deleted successfully."
}
```
**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `object` | Validation error details.  |

```json
{
    "error": "id is required."
}
```

**Error Response (404 Not found)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Error message.  |

```json
{
    "error": "Record does not exist."
}
```

---
### 16. Change User Profile
| **Field**        | **Type**   | **Description**                       | **Required** |
| ----------------- | ---------- | ------------------------------------- | ------------ |
| `username` | `string`   | New Username. | No         |
| `avatar`       | `string(base64)` | Base64 code of Avatar | No        |

**Request Example:**

```http
PUT /api/user/
Authorization: Bearer <access_token>
content_type: 'application/json'
{
    "username": "0123456789"
}

Or you can PUT
{
    "username": "0123456789",
    "avatar": <avatar>
}

{
    "avatar": <avatar>
}
```

**Response Example (200 OK):**

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `avatar`        | `string`  | User Avatar |
| `id`       | `int` | User Id |
| `username` | `string`  | User Name |
| `phone_number` | `string`  | User Phone Number |

```json
{
    'avatar': None, 
 	'id': 1,
 	'phone_number': 'testcase', 
    'username': '0123456789'
}
```
**Error Response (400 Bad Request)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Not Supported |

```json
{
    'error': 'Cannot put ReadOnly fields'
}

{
    'error': 'Invalid base64 data'
}

{
    'error': 'Image size exceeds 256KB'
}

{
    'error': 'Username too long'
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Unauthorized.   |

```json
{
    'error': 'Unauthorized'
}
```

---

### 17. Get User Profile

**Request Example:**

```http
GET /api/user/
Authorization: Bearer <access_token>
content_type: 'application/json'
```

**Response Example (200 OK):**

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `avatar`        | `string`  | User Avatar |
| `id`       | `int` | User Id |
| `username` | `string`  | User Name |
| `phone_number` | `string`  | User Phone Number |

```json
{
    'avatar': None, 
 	'id': 1,
 	'phone_number': 'testcase', 
    'username': '0123456789'
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Unauthorized.   |

```json
{
    'error': 'Unauthorized'
}
```

---

### 18. Delete User

**Request Example:**

```http
DELETE /api/user/
Authorization: Bearer <access_token>
content_type: 'application/json'
```

**Response Example (200 OK):**

| **Field**        | **Type**   | **Description**                             |
| ----------------- | ---------- | ------------------------------------------- |
| `message`        | `string`  | User Deleted |

```json
{
    'message': 'User deleted successfully'
}
```

**Error Response (400 BadRequest)**:

| **Field** | **Type** | **Description**                                |
| --------- | -------- | ---------------------------------------------- |
| `error`   | `string` | maybe database error OR User Already deleted?. |

```json
{
    'error': <err_message>
}
```

**Error Response (401 Unauthorized)**:

| **Field** | **Type** | **Description** |
| --------- | -------- | --------------- |
| `error`   | `string` | Unauthorized.   |

```json
{
    'error': 'Unauthorized'
}
```

---

## Status Codes

| **Status Code** | **Description**                                     |
| --------------- | --------------------------------------------------- |
| `200`           | OK                                                  |
| `201`           | Created                                                  |
| `400`           | Bad request                               |
| `401`           | Unauthorized - Invalid credentials or expired token |
| `404`           | Not found |
| `405`           | Method not allowed                               |
| `409`           | Conflict                               |
| `429`           | Too many requests                               |
| `500`           | Internal Server Error                               |
