# LinkConnect - College Placement Registration Platform

A professional platform for managing college placement and internship registration with **MongoDB database integration**, **role-based authentication**, and comprehensive data management.

## 🔥 Key Highlights

- ✅ **Real MongoDB Integration** - Production-ready database structure
- ✅ **Role-Based Login** - Select role during authentication (Admin/Faculty/Student)
- ✅ **Professional Architecture** - Clear data flow and routing
- ✅ **Admin Exports** - Download data by role (users, links, submissions, logins)
- ✅ **Fully Responsive** - Works on desktop, tablet, and mobile
- ✅ **JavaScript/JSX** - No TypeScript dependencies

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Start here! Quick setup guide
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Complete backend setup instructions
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Full architecture documentation

## 🗄️ MongoDB Connection

```
mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/?appName=Cluster0
```

> **Note**: Backend setup required for production use. Frontend works in demo mode for testing.

---

A comprehensive platform for managing college placement and internship registration links, with role-based access for Admin, Faculty, and Student users.

## Features

### Authentication & Roles
- Three user roles: Admin, Faculty, and Student
- Secure registration with strong password validation
- Role-based dashboard access

### For Students
- Browse available placement/internship links
- Register for opportunities with screenshot proof
- Track registration history
- View deadlines and link details

### For Faculty
- Create and manage registration links
- Generate short URLs for easy sharing
- View student submissions by link
- Export submission data to CSV
- Track registration analytics

### For Admin
- Full user management (view, deactivate, delete)
- Platform-wide analytics and statistics
- Login activity tracking with charts
- Export all data (users, links, submissions)
- User role distribution insights

## Technology Stack

### Frontend
- React with TypeScript/JSX
- Tailwind CSS for styling
- Shadcn/ui component library
- Recharts for data visualization
- Sonner for toast notifications

### Backend (MongoDB Integration Ready)
- MongoDB database structure prepared
- RESTful API endpoints defined
- Mock data for development/demo

## Getting Started

### Demo Accounts
Test the platform with these credentials:

- **Admin**: admin@college.edu / any password
- **Faculty**: faculty@college.edu / any password
- **Student**: student@college.edu / any password

### Backend Setup (Required for Production)

The frontend is ready to connect to a MongoDB backend. You need to:

1. **Set up MongoDB Database** with collections:
   - `users` - User accounts and authentication
   - `links` - Registration links created by faculty
   - `submissions` - Student registration submissions
   - `loginStats` - Login activity tracking

2. **Create Backend API** with these endpoints:
   ```
   POST   /api/auth/login
   POST   /api/auth/register
   GET    /api/links
   POST   /api/links
   PUT    /api/links/:id
   DELETE /api/links/:id
   POST   /api/submissions
   GET    /api/submissions/link/:linkId
   GET    /api/submissions/student/:studentId
   GET    /api/users
   PUT    /api/users/:id
   DELETE /api/users/:id
   GET    /api/analytics/stats
   GET    /api/analytics/logins
   GET    /api/export/users
   GET    /api/export/links
   GET    /api/export/submissions
   ```

3. **Update API URL** in `/utils/api.tsx`:
   ```javascript
   const API_BASE_URL = 'your-backend-url/api';
   ```

## File Structure

```
link-connect/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── utils/
│   └── api.tsx                  # API calls to MongoDB backend
├── components/
│   ├── Navbar.tsx               # Global navigation
│   ├── LoginForm.tsx            # Login component
│   ├── RegisterForm.tsx         # Registration component
│   ├── LinkCard.tsx             # Link display card
│   ├── CreateLinkDialog.tsx     # Link creation modal
│   └── StudentRegistrationDialog.tsx  # Registration submission
├── pages/
│   ├── AuthPage.tsx             # Login/Register page
│   ├── AdminDashboard.tsx       # Admin dashboard
│   ├── FacultyDashboard.tsx     # Faculty dashboard
│   └── StudentDashboard.tsx     # Student dashboard
└── App.tsx                      # Main application component
```

## Key Features Detail

### Link Management
- Faculty can create registration links with:
  - Custom or auto-generated short URLs
  - Deadlines for applications
  - Descriptions and titles
- Links can be edited or deleted
- Real-time registration count tracking

### Student Submissions
- Screenshot upload for proof of registration
- Form validation and file size limits
- Submission history tracking
- Status badges (completed, pending)

### Admin Analytics
- User statistics by role
- Login activity charts (7-day view)
- Total registrations and link metrics
- Export capabilities for all data

### Security Features
- Password requirements:
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - At least one number
  - At least one special character
- Role-based access control
- Protected API endpoints (ready for JWT integration)

## Responsive Design

The platform is fully responsive and works on:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## Color Palette

- Primary: Orange (#f97316, #ea580c)
- Backgrounds: White, Gray-50
- Success: Green
- Warning: Yellow
- Danger: Red

## Future Enhancements

- Email notifications for new links
- Bulk user import via Excel
- Advanced filtering and search
- Real-time updates with WebSockets
- Mobile app version
- Integration with college ERP systems

## Support

For issues or questions, refer to the project documentation or contact the development team.

---

Built with ❤️ for college placement management
