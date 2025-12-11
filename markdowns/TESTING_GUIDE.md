# Testing Guide - Faculty Links to MongoDB

Complete guide to test the faculty link creation and student access functionality.

## Prerequisites

1. **MongoDB**: Running and connected (check `.env` configuration)
2. **Backend Server**: Ready to start
3. **Frontend Dev Server**: Ready to start
4. **Test Users**: Faculty and Student accounts created in database

## Setup Steps

### 1. Start Backend Server

```bash
cd c:\Users\Lenovo\Desktop\linkconnect\backend
npm start
```

Expected output:
```
🚀 Server running on port 5000
[timestamp] GET /health
```

### 2. Start Frontend Development Server

Open another terminal:
```bash
cd c:\Users\Lenovo\Desktop\linkconnect
npm run dev
```

Expected output:
```
VITE v... building for development
  ➜  Local:   http://localhost:5173/
```

## Test Flow - Faculty Creates Link

### Step 1: Faculty Login
1. Navigate to http://localhost:5173
2. Click "Login"
3. Enter faculty credentials:
   - Email: faculty@college.edu
   - Password: (your faculty password)
4. Click Login
5. Should redirect to Faculty Dashboard

### Step 2: Create New Link
1. Click "Create Link" button (top right)
2. Fill in the form:

| Field | Example Value |
|-------|---------------|
| Title | Amazon SDE Internship 2025 |
| URL | https://amazon.jobs/en/jobs/123456 |
| Deadline | Select date 30 days in future |
| Description | Summer internship for SDE role at Amazon |

3. Note: Short URL is auto-generated (e.g., `lc.io/abc123`)
4. Click "Create Link"
5. Should see success toast: "Link created successfully!"

### Step 3: Verify in Faculty Dashboard
1. Link should appear in "My Links" tab immediately
2. Should show:
   - Title: Amazon SDE Internship 2025
   - Description: Summer internship for SDE role at Amazon
   - Deadline: Your selected date
   - Short URL: Auto-generated code
   - 0 registrations (no students registered yet)
   - Green "Active" badge
   - Edit and Delete buttons

### Step 4: Verify in Database
1. Open MongoDB Compass or CLI
2. Navigate to database and Links collection
3. Should see new document with:
   - `_id`: MongoDB ObjectId
   - `title`: "Amazon SDE Internship 2025"
   - `url`: "https://amazon.jobs/..."
   - `shortUrl`: "lc.io/xxx"
   - `deadline`: Your selected date (ISO string)
   - `createdBy`: Faculty user's ObjectId
   - `createdByEmail`: "faculty@college.edu"
   - `active`: true
   - `registrations`: 0
   - `createdAt`, `updatedAt`: Current timestamp

## Test Flow - Student Sees Link

### Step 1: Student Login
1. **Open new incognito/private browser window** (or different browser)
2. Navigate to http://localhost:5173
3. Click "Login"
4. Enter student credentials:
   - Email: student@college.edu
   - Password: (your student password)
5. Click Login
6. Should redirect to Student Dashboard

### Step 2: View Available Links
1. Student Dashboard shows three stats cards:
   - Available Links: Should show count including your new link
   - Registrations: Count of past registrations
   - Pending: Links not yet registered for

2. Tab shows "Available Links" is selected
3. **IMPORTANT**: Your newly created link should be visible in the grid

### Step 3: Verify Link Appears
The link card should display:
- Title: "Amazon SDE Internship 2025"
- Description: "Summer internship for SDE role at Amazon"
- Deadline: Your selected date
- Short URL (with copy button)
- 0 registrations (no one has registered yet)
- Green "Active" badge
- "Register Now" button

### Step 4: Register for Link
1. Click "Register Now" on the link
2. Dialog opens with link details
3. Upload a screenshot proving registration
4. Click "Submit Registration"
5. Should see success toast: "Registration submitted successfully!"
6. Dialog closes

### Step 5: Verify Registration in Faculty Dashboard
1. Go back to faculty browser window
2. Refresh Faculty Dashboard
3. Go to "Submissions" tab
4. The link should now appear in link selector buttons
5. Click the link to view submissions
6. Student's registration should appear in table:
   - Student Name: Student's name
   - Email: student@college.edu
   - Roll Number: Student's roll number
   - Status: "completed"
   - Submitted: Today's date

## Test Flow - Multiple Links & Students

### Create Multiple Faculty Links
1. As faculty, create 2-3 more links with different companies
2. Each should appear in Faculty Dashboard

### Multiple Student Registrations
1. As student, you should see all links from all faculty members
2. Register for multiple links
3. View your registration history in "My History" tab

### Faculty Export Submissions
1. As faculty, click "Export" button in Submissions tab
2. CSV file downloads containing:
   - Student Name
   - Email
   - Roll Number
   - Submitted Date
   - Status
3. Open in Excel to verify data

## Test Flow - Edit & Delete

### Edit Link (Faculty)
1. In Faculty Dashboard, click "Edit" on a link
2. Dialog opens with current data
3. Change title or description
4. Click "Update Link"
5. Should see success toast
6. Link updates in dashboard and database

### Delete Link (Faculty)
1. Click "Delete" on a link
2. Confirmation dialog appears
3. Click confirm
4. Should see success toast
5. Link disappears from dashboard
6. Students no longer see this link
7. Verify deletion in MongoDB

## Troubleshooting

### Links Not Appearing to Student
- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Frontend showing correct API URL (check browser console for API calls)
- [ ] MongoDB is running and connected
- [ ] Student is properly authenticated (check token in localStorage)
- [ ] Faculty user has correct role in database

### Create Link Button Not Working
- [ ] Faculty user is properly authenticated
- [ ] Faculty user has "faculty" role in database
- [ ] All required fields filled (title, url, deadline)
- [ ] Check browser console for error messages
- [ ] Check backend console for server errors

### Registration Not Saving
- [ ] Student is logged in properly
- [ ] Screenshot is selected before submitting
- [ ] Backend is running and accepting POST requests
- [ ] Check browser console Network tab for API response

### MongoDB Connection Issues
- [ ] Verify MongoDB URI in `.env` file
- [ ] Check MongoDB server is running
- [ ] Verify network access (if using MongoDB Atlas)
- [ ] Check backend console for connection errors

## Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Faculty creates link | Link saved to MongoDB, visible to all students |
| Student views dashboard | Sees all active links from all faculty |
| Student registers | Registration saved, visible to faculty |
| Faculty views submissions | Sees all student registrations for that link |
| Faculty edits link | Changes saved to MongoDB |
| Faculty deletes link | Link removed from MongoDB, no longer visible to students |
| Faculty exports | CSV file downloads with registration data |

## API Endpoints Being Used

```
POST   /api/links                    - Create new link (faculty)
GET    /api/links                    - Get all links (all authenticated users)
GET    /api/links/:id                - Get specific link
PUT    /api/links/:id                - Update link (faculty)
DELETE /api/links/:id                - Delete link (faculty)
```

## Success Indicators ✅

Your implementation is working correctly when:

✅ Faculty can create links with all required fields
✅ Links appear in MongoDB with proper schema
✅ Students see all faculty-created links
✅ Students can register for links
✅ Faculty can view student registrations
✅ Faculty can edit and delete their own links
✅ Permissions work correctly (faculty can't access student endpoints, etc.)
✅ Data persists across page refreshes
✅ Proper error messages appear for invalid actions

---

**Last Updated**: December 11, 2025
**Status**: Ready for Testing ✅
