# API Test Examples (All Endpoints)

Base URL:

- Local: `http://localhost:5000/api/v1`
- Deployed: `https://<your-domain>/api/v1`

Set token:

```bash
TOKEN="<access_token>"
ADMIN_TOKEN="<admin_access_token>"
COMPLAINT_ID="<complaint_uuid>"
USER_ID="<user_uuid>"
CATEGORY_ID="<category_uuid>"
DEPARTMENT_ID="<department_uuid>"
NOTIFICATION_ID="<notification_uuid>"
```

## Health

```bash
curl -X GET "http://localhost:5000/api/v1/health"
```

## Auth

```bash
curl -X POST "http://localhost:5000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Abebe Kebede",
    "university_id": "UGR/12345/15",
    "email": "abebe@astu.edu.et",
    "password": "StrongPass1",
    "department_id": null
  }'
```

```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abebe@astu.edu.et",
    "password": "StrongPass1"
  }'
```

```bash
curl -X POST "http://localhost:5000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token>"}'
```

```bash
curl -X POST "http://localhost:5000/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token>"}'
```

```bash
curl -X GET "http://localhost:5000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "StrongPass1",
    "new_password": "NewStrongPass2"
  }'
```

## Complaints

```bash
curl -X POST "http://localhost:5000/api/v1/complaints" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Water leakage in dormitory block C" \
  -F "description=Leakage near room C-214 has persisted for two days." \
  -F "category_id=$CATEGORY_ID" \
  -F "location=Dormitory Block C, second floor" \
  -F "attachments=@/path/to/photo.jpg"
```

```bash
curl -G "http://localhost:5000/api/v1/complaints" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=20" \
  --data-urlencode "status=open" \
  --data-urlencode "sort=created_at" \
  --data-urlencode "order=DESC"
```

```bash
curl -X GET "http://localhost:5000/api/v1/complaints/$COMPLAINT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X GET "http://localhost:5000/api/v1/complaints/$COMPLAINT_ID/history" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/complaints/$COMPLAINT_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "note": "Maintenance team assigned"
  }'
```

```bash
curl -X POST "http://localhost:5000/api/v1/complaints/$COMPLAINT_ID/remarks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Technician started on-site work."}'
```

```bash
curl -X DELETE "http://localhost:5000/api/v1/complaints/$COMPLAINT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Notifications

```bash
curl -X GET "http://localhost:5000/api/v1/notifications" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $TOKEN"
```

## Chatbot

```bash
curl -X POST "http://localhost:5000/api/v1/chatbot/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I report internet outage?",
    "history": [
      {"role":"user","content":"Hello"},
      {"role":"assistant","content":"Hi! How can I help you?"}
    ]
  }'
```

## Analytics

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/summary" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -G "http://localhost:5000/api/v1/analytics/timeseries" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --data-urlencode "period=daily" \
  --data-urlencode "days=30"
```

## Admin

```bash
curl -G "http://localhost:5000/api/v1/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=20" \
  --data-urlencode "search=abebe"
```

```bash
curl -X POST "http://localhost:5000/api/v1/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Getachew Tadesse",
    "email": "getachew.staff@astu.edu.et",
    "university_id": "STAFF/2026/002",
    "password": "StrongPass1",
    "department_id": "'$DEPARTMENT_ID'"
  }'
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/admin/users/$USER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"staff"}'
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/admin/users/$USER_ID/deactivate" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Categories & Departments

```bash
curl -X GET "http://localhost:5000/api/v1/categories" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST "http://localhost:5000/api/v1/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Water and Sanitation",
    "description": "Handles water supply and sanitation issues.",
    "department_id": "'$DEPARTMENT_ID'"
  }'
```

```bash
curl -X PATCH "http://localhost:5000/api/v1/categories/$CATEGORY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Water and Utilities",
    "description": "Updated category name"
  }'
```

```bash
curl -X GET "http://localhost:5000/api/v1/departments" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
