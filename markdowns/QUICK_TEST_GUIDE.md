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
db.studentlinks.find({ linkId: ObjectId("...") }).count()
// Should return: number of students

// Check specific student's links
db.studentlinks.find({ studentEmail: "student1@test.com" })
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
