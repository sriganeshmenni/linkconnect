# LinkConnect - Quick Start Guide

## 🚀 Getting Started

LinkConnect is a professional college placement registration platform with **MongoDB integration** and **role-based authentication**.

### ✅ What's Ready
- ✅ Frontend React application (JavaScript/JSX)
- ✅ Role-based login (Admin, Faculty, Student)
- ✅ MongoDB-ready API structure  
- ✅ Comprehensive documentation
- ✅ Mock data for demo/testing

### ⚠️ What You Need to Set Up
- ❌ MongoDB backend (see BACKEND_SETUP.md)
- ❌ Environment variables
- ❌ Production deployment

---

## 📁 Project Overview

```
linkconnect/
├── App.jsx                    # Main application entry
├── context/AuthContext.jsx    # Authentication & state
├── utils/api.jsx              # MongoDB API calls
├── components/               # Reusable UI components
│   ├── LoginForm.jsx        # Login with role selection
│   ├── RegisterForm.jsx     # User registration
│   ├── Navbar.jsx           # Navigation bar
│   └── ...                  # Other components
├── pages/                    # Role-based dashboards
│   ├── AdminDashboard.jsx   # Admin panel
│   ├── FacultyDashboard.jsx # Faculty panel
│   └── StudentDashboard.jsx # Student panel
└── BACKEND_SETUP.md         # Backend setup guide
```

---

## 🔐 Role-Based Login

The platform requires users to select their role during login:

### Roles:
1. **Student** 🎓
   - View available links
   - Submit registrations with screenshots
   - Track submission history

2. **Faculty** 👨‍🏫
   - Create and manage links
   - View student submissions
   - Export submission data

3. **Admin** 👑
   - Full system access
   - User management
   - Analytics and reports
   - Download all data by role

---

## 🗄️ MongoDB Database

### Connection String:
```
mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/?appName=Cluster0
```

### Collections Required:

#### 1. **users**
- Stores user accounts (admins, faculty, students)
- Fields: name, email, password (hashed), role, rollNumber, active, lastLogin

#### 2. **links**
- Placement/internship registration links
- Fields: title, url, shortUrl, deadline, description, createdBy, registrations

#### 3. **submissions**
- Student registration submissions
- Fields: linkId, studentId, studentName, screenshot, status, submittedAt

#### 4. **loginStats**
- Login analytics for admin dashboard
- Fields: date, totalLogins, roleBreakdown

---

## ⚙️ Current Setup Status

### ✅ Working (Demo Mode):
- User login/registration (uses localStorage)
- Link creation and management
- Student submissions
- Dashboard navigation
- Role-based UI

### ⏳ Requires Backend:
- Real database persistence
- JWT authentication
- File uploads to server
- Excel/CSV exports
- Login tracking

---

## 🛠️ Setup Instructions

### 1. Frontend (Already Done)
The frontend is ready to use. It will work in demo mode without a backend.

### 2. Backend Setup (Required for Production)

Follow the **BACKEND_SETUP.md** guide to:

1. Create Node.js backend
2. Connect to MongoDB
3. Implement API endpoints
4. Add authentication
5. Enable exports

**Quick Backend Setup:**

```bash
# Create backend folder
mkdir linkconnect-backend
cd linkconnect-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer exceljs

# Create .env file
echo "MONGODB_URI=mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/linkconnect" > .env
echo "JWT_SECRET=your_secret_key_here" >> .env
echo "PORT=5000" >> .env

# Follow BACKEND_SETUP.md for complete code
```

### 3. Connect Frontend to Backend

Update `/utils/api.jsx`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
// or for local development
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 📊 Data Flow

### Authentication Flow:
```
User → Select Role → Enter Credentials → POST /api/auth/login
→ Verify in MongoDB → Generate JWT → Store token → Redirect to Dashboard
```

### Link Creation Flow (Faculty):
```
Faculty → Create Link Dialog → POST /api/links → Save to MongoDB
→ Auto-generate short URL → Return link → Update UI
```

### Student Registration Flow:
```
Student → Select Link → Upload Screenshot → POST /api/submissions
→ Save to MongoDB → Increment link.registrations → Update UI
```

### Admin Export Flow:
```
Admin → Select Role/Type → GET /api/export/:type/:role
→ Query MongoDB → Generate Excel → Download File
```

---

## 📥 Admin Export Features

Admin can download:

1. **All Users**
   - Complete user database
   - Fields: name, email, role, status, last login

2. **Users by Role**
   - Filter by: admin, faculty, or student
   - Separate files for each role

3. **All Links**
   - All placement links created
   - Includes registration counts

4. **All Submissions**
   - Student registration records
   - Includes screenshots (as base64/URLs)

5. **Login History**
   - Track who logged in and when
   - Useful for attendance/activity monitoring

---

## 🔒 Security Features

1. **Password Requirements**:
   - Minimum 8 characters
   - Uppercase + lowercase letters
   - At least one number
   - At least one special character

2. **Role-Based Access**:
   - Users can only access features for their role
   - API endpoints check role permissions

3. **JWT Authentication**:
   - Tokens expire in 24 hours
   - Stored securely in localStorage

4. **Input Validation**:
   - Server-side validation for all inputs
   - Prevents SQL injection, XSS attacks

---

## 🎨 Features by Role

### Student Features:
- ✅ Browse active placement links
- ✅ Submit registration with screenshot proof
- ✅ View submission history
- ✅ See deadlines and link details
- ✅ Track registration status

### Faculty Features:
- ✅ Create placement/internship links
- ✅ Edit or delete own links
- ✅ Generate short URLs automatically
- ✅ View all student submissions by link
- ✅ Export submission data to CSV
- ✅ See registration analytics

### Admin Features:
- ✅ View all users in system
- ✅ Activate/deactivate user accounts
- ✅ Delete users
- ✅ View platform-wide statistics
- ✅ Login activity charts (7-day view)
- ✅ Export all data (users, links, submissions, logins)
- ✅ Export data filtered by role
- ✅ Monitor system health

---

## 📱 Responsive Design

The platform works on:
- 💻 Desktop (1024px and above)
- 📱 Tablet (768px - 1023px)
- 📱 Mobile (below 768px)

All dashboards, forms, and tables are fully responsive.

---

## 🐛 Troubleshooting

### Issue: "API Error: Failed to fetch"
**Solution**: Backend is not running or URL is incorrect
- Check if backend is running on port 5000
- Verify API_BASE_URL in `/utils/api.jsx`
- Currently using demo mode with localStorage

### Issue: "Invalid credentials or role"
**Solution**: Role mismatch
- Ensure you select the correct role during login
- Your account role in database must match selected role

### Issue: Data not persisting after refresh
**Solution**: Backend not connected
- Demo mode uses localStorage (temporary)
- Set up MongoDB backend for persistence

### Issue: Exports not working
**Solution**: Backend export endpoints not implemented
- Follow BACKEND_SETUP.md to add export functionality
- Requires Express + ExcelJS packages

---

## 🚀 Deployment Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Create backend with all API endpoints
- [ ] Add environment variables
- [ ] Test authentication flow
- [ ] Deploy backend (Heroku/Render/Railway)
- [ ] Update frontend API_BASE_URL
- [ ] Configure CORS for production domain
- [ ] Enable MongoDB backups
- [ ] Set up error logging
- [ ] Test all role-based features
- [ ] Deploy frontend (Vercel/Netlify)

---

## 📖 Additional Documentation

- **PROJECT_STRUCTURE.md** - Complete architecture overview
- **BACKEND_SETUP.md** - Step-by-step backend setup
- **README.md** - General project information

---

## 💡 Quick Tips

1. **Demo Mode**: Works without backend for testing UI/UX
2. **Role Selection**: Required in login - must match database role
3. **Exports**: Need backend to generate Excel/CSV files
4. **Screenshots**: Students upload proof of registration
5. **Short URLs**: Auto-generated or custom (faculty choice)

---

## 🆘 Support

For issues or questions:
1. Check BACKEND_SETUP.md for backend issues
2. Check PROJECT_STRUCTURE.md for architecture
3. Review console logs for errors
4. Verify MongoDB connection string

---

**Built for Professional College Placement Management** 🎓

**Version**: 1.0.0  
**Last Updated**: November 1, 2025
