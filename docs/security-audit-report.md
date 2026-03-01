# Security Audit Report

## Project
ASTU Smart Complaint & Issue Tracking System (Backend)

## Scope
Backend API security controls, authorization boundaries, input/file validation, and abuse protections.

---

## 1) Identified Risks

1. Unauthorized users accessing protected complaint/admin endpoints.
2. Privilege escalation across roles (`student` -> `staff/admin`).
3. Malicious file uploads (invalid MIME, oversized files).
4. SQL injection attempts through request input.
5. Brute-force login attempts and API abuse.
6. Stolen refresh token replay.

---

## 2) Preventive Measures Implemented

### A) Authentication & Authorization
- JWT access/refresh token strategy implemented.
- Role checks enforced with RBAC middleware.
- Token refresh rotation implemented with denylist.
- Refresh replay blocked (revoked token check).

### B) Access Control
- Complaint endpoints protected by auth middleware.
- Staff/admin-only operations protected by role checks.
- Admin-only user/category management protected by RBAC.

### C) File Upload Security
- Upload middleware validates allowed MIME types.
- Upload middleware enforces max file size limits.
- Attachment count limits applied in complaint submission route.

### D) Injection Resistance
- Database operations use parameterized SQL queries (`$1`, `$2`, ...).
- Request payloads validated before service execution.

### E) Abuse Prevention
- General API rate limiting enabled.
- Auth-specific rate limiting enabled.
- Upload/chatbot rate limiting enabled.

### F) Error Handling
- Centralized error middleware standardizes responses.
- Internal details are not leaked to API consumers.

---

## 3) Testing Approach

1. **Functional security checks via API:**
   - Attempt role-restricted routes with lower-privilege token.
   - Validate `403/401` responses for unauthorized actions.

2. **Validation checks:**
   - Send invalid payload types/required fields missing.
   - Confirm request rejection with controlled error responses.

3. **File upload checks:**
   - Upload unsupported file type and oversized file.
   - Confirm upload rejection.

4. **Rate limit checks:**
   - Burst auth and API requests.
   - Confirm rate-limit headers and rejection behavior.

5. **Refresh token replay test:**
   - Use refresh token once (success expected).
   - Reuse same refresh token (revoked expected).

---

## 4) Results Summary

- RBAC controls are in place and enforced across protected routes.
- Input validation and upload guards are implemented.
- Rate-limiting controls are active.
- SQL injection risk is reduced through parameterized queries.
- Refresh token replay protection is implemented with denylist + rotation.

---

## 5) Residual Risks & Recommendations

1. Add CI security checks (lint + dependency audit + SAST).
2. Add structured audit logging for security-sensitive events.
3. Add automated integration tests for role boundary scenarios.
4. Move file storage to managed object storage for production hardening.
5. Periodic key rotation policy for JWT secrets.

---

## 6) Conclusion

The backend implements the required cybersecurity controls requested for the final project:
RBAC enforcement, unauthorized access prevention, secure upload validation, SQL injection mitigation, secure JWT authentication, and rate-limiting safeguards.
