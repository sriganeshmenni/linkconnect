# LinkConnect - Project Structure & Architecture

## Overview
LinkConnect is a professional college placement registration platform with MongoDB database integration, role-based authentication, and comprehensive data management.

## Technology Stack

### Frontend
- **Framework**: React (JavaScript/JSX)
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Notifications**: Sonner
- **State Management**: React Context API

### Backend (Required)
- **Database**: MongoDB Atlas
- **API**: Node.js + Express
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (for screenshots)
- **Export**: ExcelJS or CSV

## MongoDB Database Structure

### Connection String
```
mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/?appName=Cluster0
```

### Database Name: `linkconnect`

### Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  role: String (enum: ['admin', 'faculty', 'student']),
  rollNumber: String (required for students),
  active: Boolean (default: true),
  createdAt: Date,
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ipAddress: String
  }]
}
```

#### 2. **links**
```javascript
{
  _id: ObjectId,
  title: String,
  url: String,
  shortUrl: String (unique),
  deadline: Date,
  description: String,
  createdBy: ObjectId (ref: users),
  createdByEmail: String,
  active: Boolean (default: true),
  registrations: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **submissions**
```javascript
{
  _id: ObjectId,
  linkId: ObjectId (ref: links),
  studentId: ObjectId (ref: users),
  studentName: String,
  studentEmail: String,
  rollNumber: String,
  screenshot: String (base64 or S3 URL),
  status: String (enum: ['pending', 'completed', 'verified']),
  submittedAt: Date,
  verifiedBy: ObjectId (ref: users, optional),
  verifiedAt: Date (optional)
}
```

#### 4. **loginStats**
```javascript
{
  _id: ObjectId,
  date: Date (indexed),
  totalLogins: Number,
  roleBreakdown: {
    admin: Number,
    faculty: Number,
    student: Number
  },
  uniqueUsers: [ObjectId]
}
```

## File Structure

```
linkconnect/
├── Frontend (React)
│   ├── components/
│   │   ├── LoginForm.jsx              # Login with role selection
│   │   ├── RegisterForm.jsx           # Registration with validation
│   │   ├── Navbar.jsx                 # Global navigation
│   │   ├── LinkCard.jsx               # Link display component
│   │   ├── CreateLinkDialog.jsx       # Create/edit link modal
│   │   ├── StudentRegistrationDialog.jsx  # Submit registration
│   │   └── ui/                        # Shadcn components
│   ├── pages/
│   │   ├── AuthPage.jsx               # Login/Register page
│   │   ├── AdminDashboard.jsx         # Admin panel
│   │   ├── FacultyDashboard.jsx       # Faculty panel
│   │   └── StudentDashboard.jsx       # Student panel
│   ├── context/
│   │   └── AuthContext.jsx            # Auth state management
│   ├── utils/
│   │   └── api.jsx                    # MongoDB API calls
│   ├── App.jsx                        # Main app component
│   └── styles/
│       └── globals.css                # Global styles
│
└── Backend (Node.js + Express) [TO BE CREATED]
    ├── server.js                      # Express server setup
    ├── config/
    │   └── database.js                # MongoDB connection
    ├── models/
    │   ├── User.js                    # User schema
    │   ├── Link.js                    # Link schema
    │   ├── Submission.js              # Submission schema
    │   └── LoginStat.js               # Login stats schema
    ├── routes/
    │   ├── auth.js                    # Authentication routes
    │   ├── users.js                   # User management
    │   ├── links.js                   # Link CRUD
    │   ├── submissions.js             # Submission management
    │   ├── analytics.js               # Statistics
    │   └── export.js                  # Data export
    ├── middleware/
    │   ├── auth.js                    # JWT verification
    │   └── roleCheck.js               # Role-based access
    └── controllers/
        ├── authController.js
        ├── userController.js
        ├── linkController.js
        ├── submissionController.js
        └── analyticsController.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email, password, role
- `POST /api/auth/logout` - Logout and track session
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/toggle-status` - Activate/deactivate

### Links (Faculty & Admin)
- `GET /api/links` - Get all links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Submissions (All roles)
- `POST /api/submissions` - Create submission (Student)
- `GET /api/submissions/link/:linkId` - Get by link (Faculty/Admin)
- `GET /api/submissions/student/:studentId` - Get by student
- `PUT /api/submissions/:id/verify` - Verify submission (Faculty/Admin)

### Analytics (Admin)
- `GET /api/analytics/stats` - Overall statistics
- `GET /api/analytics/logins` - Login statistics
- `GET /api/analytics/users/role/:role` - Users by role

### Export (Admin)
- `GET /api/export/users` - Export all users (Excel/CSV)
- `GET /api/export/users/role/:role` - Export users by role
- `GET /api/export/links` - Export all links
- `GET /api/export/submissions` - Export all submissions
- `GET /api/export/logins` - Export login history

## Data Flow

### 1. Authentication Flow
```
User → LoginForm (with role) → POST /api/auth/login → MongoDB users collection
     → Verify credentials + role → Generate JWT → Store in localStorage
     → Redirect to role-based dashboard
```

### 2. Link Creation Flow (Faculty)
```
Faculty → CreateLinkDialog → POST /api/links → MongoDB links collection
       → Auto-generate short URL → Return created link → Update UI
```

### 3. Student Registration Flow
```
Student → View Links → Select Link → Upload Screenshot
       → POST /api/submissions → MongoDB submissions collection
       → Increment link.registrations → Update UI
```

### 4. Admin Export Flow
```
Admin → Select Export Type → GET /api/export/:type
     → Query MongoDB with filters → Generate Excel/CSV
     → Download file
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds 10
2. **JWT Authentication**: Tokens expire in 24 hours
3. **Role-Based Access**: Middleware checks user role
4. **Input Validation**: Server-side validation for all inputs
5. **Rate Limiting**: Prevent brute force attacks
6. **CORS**: Configured for frontend domain only

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

## User Roles & Permissions

### Admin
- ✅ View all users, links, submissions
- ✅ Create/edit/delete users
- ✅ Deactivate/activate accounts
- ✅ View analytics and statistics
- ✅ Export all data (overall and role-based)
- ✅ View login history

### Faculty
- ✅ Create/edit/delete own links
- ✅ View student submissions
- ✅ Export submission data
- ✅ View link analytics
- ❌ Cannot manage users

### Student
- ✅ View available links
- ✅ Submit registrations
- ✅ View own submission history
- ❌ Cannot create links
- ❌ Cannot view other students' data

## Installation & Setup

### Frontend Setup
```bash
# Already set up in this environment
# Just ensure all dependencies are installed
```

### Backend Setup (Required)
```bash
# Create new Node.js project
mkdir linkconnect-backend
cd linkconnect-backend
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer exceljs

# Create .env file with MongoDB URI
# Set up MongoDB collections
# Start server: node server.js
```

## Deployment Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Create database indexes (email, role, date)
- [ ] Deploy backend to Heroku/Render/Railway
- [ ] Update frontend API_BASE_URL
- [ ] Configure CORS for production domain
- [ ] Set up environment variables
- [ ] Test all role-based features
- [ ] Enable MongoDB backup
- [ ] Set up monitoring and logging

## Future Enhancements

1. Email notifications for new links
2. SMS alerts for deadlines
3. Bulk student import via Excel
4. Advanced analytics dashboard
5. Mobile app (React Native)
6. Real-time notifications (Socket.io)
7. Document verification system
8. Placement statistics reports
9. Integration with college ERP

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Maintained By**: LinkConnect Development Team
