# SplitMint API Reference

Complete API documentation for SplitMint backend.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses are JSON:

**Success (2xx)**:

```json
{
  "message": "Success description",
  "data": {
    /* response data */
  }
}
```

**Error (4xx, 5xx)**:

```json
{
  "message": "Error description",
  "errors": [
    /* validation errors if applicable */
  ]
}
```

---

## Authentication Endpoints

### Register User

```
POST /auth/register
```

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:

- 400: Missing fields or invalid email format
- 400: User already exists with this email

---

### Login User

```
POST /auth/login
```

**Request**:

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:

- 400: Missing email or password
- 401: Invalid credentials

---

### Get Current User

```
GET /auth/me
```

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:

- 401: No token provided or invalid token

---

## Group Endpoints

### Create Group

```
POST /groups
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:

```json
{
  "name": "Weekend Trip",
  "description": "Trip to mountain resort"
}
```

**Response** (201 Created):

```json
{
  "message": "Group created successfully",
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Weekend Trip",
    "owner": { "id": "...", "name": "John Doe" },
    "participants": [
      {
        "userId": { "id": "...", "name": "John Doe" },
        "name": "John Doe",
        "color": "#3B82F6"
      }
    ],
    "totalSpent": 0,
    "description": "Trip to mountain resort",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get All Groups

```
GET /groups
```

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "groups": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Weekend Trip",
      "owner": { "id": "...", "name": "John Doe" },
      "participants": [...],
      "totalSpent": 500,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Group Details

```
GET /groups/:id
```

**Parameters**:

- `id`: Group ID (ObjectId)

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "group": { /* group object */ },
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "amount": 100,
      "description": "Dinner",
      "date": "2024-01-15T19:00:00Z",
      "payer": { "id": "...", "name": "John Doe" },
      "splitMode": "equal",
      "participants": [...]
    }
  ],
  "balances": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "debtor": { "id": "...", "name": "Jane Smith" },
      "creditor": { "id": "...", "name": "John Doe" },
      "amount": 50
    }
  ]
}
```

---

### Update Group

```
PUT /groups/:id
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:

```json
{
  "name": "Summer Trip",
  "description": "Updated description"
}
```

**Response** (200 OK):

```json
{
  "message": "Group updated successfully",
  "group": {
    /* updated group */
  }
}
```

**Errors**:

- 403: Only owner can update group
- 404: Group not found

---

### Delete Group

```
DELETE /groups/:id
```

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "message": "Group deleted successfully"
}
```

**Note**: All expenses and balances for this group will be deleted.

---

### Add Participant

```
POST /groups/:id/participants
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "color": "#10B981"
}
```

**Response** (200 OK):

```json
{
  "message": "Participant added successfully",
  "group": {
    /* updated group with new participant */
  }
}
```

**Errors**:

- 400: Maximum 4 participants allowed
- 403: Only owner can add participants

---

### Remove Participant

```
DELETE /groups/:id/participants
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:

```json
{
  "participantIndex": 1
}
```

**Response** (200 OK):

```json
{
  "message": "Participant removed successfully",
  "group": {
    /* updated group without participant */
  }
}
```

---

### Update Participant

```
PUT /groups/:id/participants
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:

```json
{
  "participantIndex": 0,
  "name": "John Smith",
  "color": "#EF4444"
}
```

**Response** (200 OK):

```json
{
  "message": "Participant updated successfully",
  "group": {
    /* updated group */
  }
}
```

---

## Expense Endpoints

### Create Expense

```
POST /expenses
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request (Equal Split)**:

```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "amount": 120,
  "description": "Dinner at restaurant",
  "date": "2024-01-15",
  "splitMode": "equal",
  "participants": [
    { "userId": "user1", "name": "John Doe" },
    { "userId": "user2", "name": "Jane Smith" },
    { "userId": "user3", "name": "Bob Johnson" }
  ],
  "notes": "Great dinner!"
}
```

**Request (Custom Amounts)**:

```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "amount": 120,
  "description": "Dinner",
  "splitMode": "custom",
  "participants": [
    { "userId": "user1", "name": "John Doe", "amount": 60 },
    { "userId": "user2", "name": "Jane Smith", "amount": 40 },
    { "userId": "user3", "name": "Bob Johnson", "amount": 20 }
  ]
}
```

**Request (Percentage)**:

```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "amount": 120,
  "description": "Dinner",
  "splitMode": "percentage",
  "participants": [
    { "userId": "user1", "name": "John Doe", "percentage": 50 },
    { "userId": "user2", "name": "Jane Smith", "percentage": 30 },
    { "userId": "user3", "name": "Bob Johnson", "percentage": 20 }
  ]
}
```

**Response** (201 Created):

```json
{
  "message": "Expense created successfully",
  "expense": {
    "_id": "507f1f77bcf86cd799439012",
    "group": "507f1f77bcf86cd799439011",
    "amount": 120,
    "description": "Dinner at restaurant",
    "date": "2024-01-15T00:00:00Z",
    "payer": { "id": "...", "name": "John Doe" },
    "splitMode": "equal",
    "participants": [
      { "userId": { "id": "..." }, "name": "John Doe", "amount": 40 },
      { "userId": { "id": "..." }, "name": "Jane Smith", "amount": 40 },
      { "userId": { "id": "..." }, "name": "Bob Johnson", "amount": 40 }
    ]
  }
}
```

---

### Get Expenses

```
GET /expenses
```

**Query Parameters**:

- `groupId`: Filter by group
- `participant`: Filter by participant user ID
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount
- `search`: Search in description and notes

**Example**:

```
GET /expenses?groupId=507f1f77bcf86cd799439011&startDate=2024-01-01&maxAmount=200
```

**Response** (200 OK):

```json
{
  "expenses": [
    /* array of expense objects */
  ]
}
```

---

### Get Expense Details

```
GET /expenses/:id
```

**Response** (200 OK):

```json
{
  "expense": {
    /* expense object */
  }
}
```

---

### Update Expense

```
PUT /expenses/:id
```

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**: Same as Create Expense (only include fields to update)

**Response** (200 OK):

```json
{
  "message": "Expense updated successfully",
  "expense": {
    /* updated expense */
  }
}
```

**Errors**:

- 403: Only owner or payer can update expense
- 404: Expense not found

---

### Delete Expense

```
DELETE /expenses/:id
```

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "message": "Expense deleted successfully"
}
```

---

### Get Group Balances

```
GET /expenses/group/:groupId/balances
```

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "totalOwed": 150,
  "totalOwes": 50,
  "balances": [
    {
      "debtor": { "id": "...", "name": "Jane Smith" },
      "creditor": { "id": "...", "name": "John Doe" },
      "amount": 40
    }
  ],
  "allBalances": [
    /* all balance documents */
  ]
}
```

---

## Health Check

```
GET /health
```

**Response** (200 OK):

```json
{
  "status": "Backend is running"
}
```

---

## Error Codes

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| 200  | OK - Request succeeded                        |
| 201  | Created - Resource created successfully       |
| 400  | Bad Request - Invalid input or missing fields |
| 401  | Unauthorized - Missing or invalid token       |
| 403  | Forbidden - User doesn't have permission      |
| 404  | Not Found - Resource doesn't exist            |
| 500  | Internal Server Error - Server error          |

---

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Create Group (replace TOKEN)

```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Trip",
    "description": "Mountain resort trip"
  }'
```

### Get Groups

```bash
curl -X GET http://localhost:5000/api/groups \
  -H "Authorization: Bearer TOKEN"
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Validate input** on frontend before sending to API
3. **Handle errors gracefully** in client applications
4. **Use specific date formats** (YYYY-MM-DD or ISO 8601)
5. **Store JWT token securely** (localStorage acceptable for this app)
6. **Refresh token** if expired (currently expires after 7 days)
7. **Test endpoints** with both valid and invalid data

---

## Postman Collection

Import this JSON into Postman to test all endpoints:

```json
{
  "info": { "name": "SplitMint API", "version": "1.0" },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"John\",\"email\":\"john@example.com\",\"password\":\"pass123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

Replace `{{baseUrl}}` with `http://localhost:5000/api` or your production URL.
