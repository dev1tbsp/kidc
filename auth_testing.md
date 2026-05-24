# Auth Testing Playbook

## Admin Credentials
- Email: `admin@kidsfeast.com`
- Password: `admin123`

## Step 1: MongoDB Verification
```
mongosh
use kidsfeast_db
db.users.find({role: "admin"}).pretty()
```
Expect: `password_hash` starts with `$2b$`. Indexes on `users.email` (unique), `login_attempts.identifier`, `password_reset_tokens.expires_at` (TTL).

## Step 2: API Testing
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -c cookies.txt -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kidsfeast.com","password":"admin123"}'

curl -b cookies.txt "$API_URL/api/auth/me"

curl -b cookies.txt -X POST "$API_URL/api/auth/logout"
```
Login should return user + set `access_token` and `refresh_token` cookies. `/me` returns same user. Logout clears cookies.

## Step 3: Brute Force
- 5 wrong passwords for same email returns 429 (locked) within 15 min window.
