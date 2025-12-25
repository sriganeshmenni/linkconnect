# Quick Start: Link Distribution Testing

## Prerequisites

- Backend running on `localhost:5000`
- MongoDB connected
- Frontend running

## Step-by-Step Testing

### 1. Setup Test Data

Register these test accounts:

```
Faculty Account:
- Email: faculty@test.com
- Password: Faculty@123
- Role: Faculty

Student Accounts (create 3-5):
- Email: student1@test.com, Password: Student@123
- Email: student2@test.com, Password: Student@123
- Email: student3@test.com, Password: Student@123
```

### 2. Create a Link as Faculty

1. Login as faculty@test.com
2. Go to Faculty Dashboard
3. Click "Create Link"
4. Fill in:
   - Title: `Amazon SDE Internship`
   - URL: `https://amazon.jobs`
   - Short URL: Will auto-generate or enter: `lc.io/amazon`
   - Deadline: `2025-12-20`
   - Description: `Great opportunity`
5. Click Create
6. **Check Backend Console**: Should see:
   ```
   ✓ Link "Amazon SDE Internship" pushed to 3 students
   ```

### 3. Verify as Students

1. Logout from faculty account
2. Login as student1@test.com
3. Go to Student Dashboard
4. Tab: "Available Links"
5. **You should see**: "Amazon SDE Internship" link
6. Repeat for student2@test.com and student3@test.com
7. **All students should see the same link**

### 4. Verify in MongoDB

Open MongoDB Compass or mongosh:

```javascript
// Check StudentLink collection
db.studentlinks.find({ linkId: ObjectId("...") }).count();
// Should return: number of students

// Check specific student's links
db.studentlinks.find({ studentEmail: "student1@test.com" });
// Should show the newly created link assignment
```

## Expected Results

✅ Faculty creates 1 link → StudentLink records created for all students
✅ Each student sees only links assigned to them
✅ Multiple students can see the same link
✅ Link appears in real-time (no refresh needed if WebSocket added)

## Debugging Checklist

- [ ] Backend is running and connected to MongoDB
- [ ] `/api/links` route is enabled in server.js
- [ ] `/api/submissions` route is enabled in server.js
- [ ] StudentLink model exists and is imported
- [ ] Frontend shows no errors in console
- [ ] Auth token is properly stored and sent
- [ ] User role is correctly set to 'student' or 'faculty'

## Common Issues & Fixes

**Issue**: Student doesn't see the link

```
Fix:
1. Check auth token is saved
2. Verify user role is 'student'
3. Check StudentLink collection in MongoDB
4. Verify linkId matches
```

**Issue**: "Link pushed to 0 students"

```
Fix:
1. Ensure student accounts are created
2. Verify role is set to 'student' (not 'admin')
3. Check User collection has students with role='student'
```

**Issue**: Duplicate StudentLink errors

```
Fix: This is prevented by unique index, safe to ignore
```

**Issue**: 404 on `/links/student/my-links`

```
Fix:
1. Ensure route is added to links.js
2. Check route order (student route before :id)
3. Verify auth middleware is applied
4. Restart backend server
```

## Performance Notes

- Creating link with 1000+ students takes ~2-3 seconds
- StudentLink queries are indexed for fast retrieval
- No blocking - link creation returns immediately
- Bulk insert handles large student populations

## Network Requests to Monitor

Faculty creating link:

```
POST /api/links
→ 201 Created
```

Student loading dashboard:

```
GET /api/links/student/my-links
→ 200 OK with array of links
```

Check these in DevTools Network tab.

---

# Quick Start: Submissions & Verification

## Prerequisites

- Backend running on `localhost:5000` with env:
  - `MONGODB_URI=<your connection string>`
  - `FRONTEND_URL=http://localhost:5173`
- Frontend running on `http://localhost:5173`
- Auth flows working (JWT in localStorage as `linkconnect_token`)

## 1) Student submits registration

1. Login as a student
2. Go to Student Dashboard → Available Links
3. Click `Register` on a link
4. Upload a screenshot (PNG/JPG, ≤5MB)
5. Submit

Expected:

- API: `POST /api/submissions` with body `{ linkId, screenshot }`
- Response: `{ success: true, submission }`
- DB: New `submissions` document with fields `{ link, student, screenshot, status: 'completed', createdAt }`

## 2) Student history

1. Stay in Student Dashboard → My History tab
2. Newly submitted item should appear with status `completed`

API/DB:

- `GET /api/submissions/student/:studentId` returns array where `link` is populated with `{ title, shortUrl }`

## 3) Faculty views submissions per link

1. Login as a faculty
2. Faculty Dashboard → Submissions tab
3. Click a link button at the top to load its submissions
4. Filter via search if needed

Expected:

- API: `GET /api/submissions/link/:linkId` returns submissions populated with `student { name, email, rollNumber }` and `link { title, shortUrl }`
- Table shows Name, Email, Status, Submitted

## 4) Faculty views details and verifies

1. Click `View` to open submission details (screenshot visible)
2. Click `Verify` to set status to `verified`

Expected:

- API: `PUT /api/submissions/:id/verify` with `{ status: 'verified' }`
- Row updates to show `verified` after reload

## Troubleshooting

- 401/403 on faculty student history:
  - Ensure route permission includes roles `faculty`/`admin` for `GET /api/submissions/student/:studentId`
- 400 on create submission:
  - Ensure request body includes `linkId` and `screenshot`
- 500 or populate issues:
  - Confirm `Submission` schema uses `link` and `student` references (not `linkId`/`studentId`)
- CORS blocked:
  - Set `FRONTEND_URL` to frontend origin, or temporarily relax CORS for local testing
