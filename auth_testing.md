# Auth-Gated App Testing Playbook (Emergent Google Auth)

## Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Step 2: Test Backend API
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

## Step 3: Browser Testing
await page.context.add_cookies([{
  "name": "session_token", "value": "YOUR_SESSION_TOKEN",
  "domain": "your-app.com", "path": "/", "httpOnly": true, "secure": true, "sameSite": "None"
}])

## Admin Google allowlist
Emails in `ADMIN_ALLOWED_EMAILS` env (comma-separated) may enter /admin. Currently: rajlokesh973@gmail.com

## Checklist
- [ ] User doc has `user_id` (custom UUID). MongoDB `_id` excluded via projection.
- [ ] Session `user_id` matches user's `user_id`.
- [ ] `/api/auth/me` returns user via cookie OR Bearer.
- [ ] Admin dashboard accessible only for allowlisted emails.
- [ ] Callback detection uses `useLocation().hash`.
