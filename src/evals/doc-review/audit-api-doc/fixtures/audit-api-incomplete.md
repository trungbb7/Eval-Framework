# User API Service

API documentation for retrieving user profile data.

## Get User Profile
`GET /api/v1/users/profile`

Fetches authenticated user information.

### Request Parameters
- `userId`: id of the user

### Response
Returns user data in JSON format.

```json
{
  "name": "John Doe"
}
```
