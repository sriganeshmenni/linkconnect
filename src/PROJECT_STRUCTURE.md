## Exports, Imports, and API Call Patterns

### Backend (Node.js/Express)

- **Exports/Imports:**
  - Uses CommonJS (`module.exports` / `require`).
  - Example (model):
    ```js
    // models/User.js
    const mongoose = require('mongoose');
    const userSchema = new mongoose.Schema({ ... });
    module.exports = mongoose.models.User || mongoose.model('User', userSchema);
    ```
  - Example (controller):
    ```js
    // controllers/userController.js
    exports.getAll = async (req, res) => { ... };
    ```
  - Example (import in route):
    ```js
    // routes/users.js
    const userController = require('../controllers/userController');
    ```

- **Exports to Database:**
  - All models in `/models` are exported and imported by controllers to interact with MongoDB.
  - Controllers export functions that are imported by routes to handle API endpoints.

- **API Calls and Role Checks:**
  - Express routes use middleware to attach `req.user` (from JWT) to each request.
  - Example:
    ```js
    // middleware/auth.js
    req.user = { _id, email, role, ... };
    ```
  - Role-based logic in controllers/routes:
    ```js
    if (req.user.role === 'faculty') { ... }
    if (req.user.role === 'admin') { ... }
    ```
  - Example API endpoint:
    ```js
    // routes/links.js
    router.get('/', auth, linkController.getAll);
    // linkController.js
    exports.getAll = async (req, res) => {
      if (req.user.role === 'admin') {
        // return all links
      } else if (req.user.role === 'faculty') {
        // return only links created by this faculty
      }
    }
    ```

### Frontend (React)

- **Exports/Imports:**
  - Uses ES Modules (`export` / `import`).
  - Example (component):
    ```js
    // components/LinkCard.tsx
    export const LinkCard = (props) => { ... };
    // pages/FacultyDashboard.tsx
    import { LinkCard } from '../components/LinkCard';
    ```
  - Example (context):
    ```js
    // context/AuthContext.jsx
    export const AuthContext = React.createContext();
    export const AuthProvider = ({ children }) => { ... };
    // App.tsx
    import { AuthProvider } from './context/AuthContext';
    ```

- **API Calls:**
  - All API calls are made via `src/utils/api.jsx`.
  - Example:
    ```js
    // src/utils/api.jsx
    export const linksAPI = {
      getAll: async () => {
        const response = await apiCall('/links');
        return response.links || response;
      },
      create: async (linkData) => { ... }
    };
    // Usage in FacultyDashboard.tsx
    import { linksAPI } from '../utils/api';
    useEffect(() => { linksAPI.getAll().then(setLinks); }, []);
    ```

- **Frontend-Backend Data Flow:**
  - Components/pages call API utility functions, which send requests to backend endpoints.
  - JWT token is attached to requests via headers (handled in `api.jsx`).
  - Backend decodes token, attaches user info to `req.user`, and applies role-based logic.

---
## Detailed File & Module Connections

### Frontend (src/)

- **App.tsx / App.jsx**: Entry point, sets up routing and wraps the app in `AuthProvider` for authentication context.
  - Imports: `AuthContext.jsx`, `pages/`, `components/`

- **context/AuthContext.jsx**: Provides authentication state and user info to all components via React Context.
  - Used by: `App.tsx`, all dashboard and auth pages, API utility for token management

- **utils/api.jsx**: Centralizes all API calls to the backend. Handles authentication headers, error handling, and provides methods for links, submissions, analytics, etc.
  - Used by: All dashboard pages, registration dialogs, and some components

- **pages/**: Each dashboard or page is a React component that fetches data and renders UI.
  - `AdminDashboard.tsx`: Uses `linksAPI`, `usersAPI`, `analyticsAPI` from `api.jsx` to display admin data
  - `FacultyDashboard.tsx`: Uses `linksAPI`, `analyticsAPI`, `submissionsAPI` for faculty-specific data
  - `StudentDashboard.tsx`: Uses `linksAPI.getStudentLinks`, `submissionsAPI.getMySubmissions` for student data
  - `AuthPage.tsx`: Handles login/register, uses `AuthContext` and `api.jsx`

- **components/**: UI building blocks, often reused across pages.
  - `LoginForm.jsx`, `RegisterForm.jsx`: Used in `AuthPage.tsx`
  - `Navbar.jsx`/`Navbar.tsx`: Used in all dashboards/pages
  - `LinkCard.tsx`, `CreateLinkDialog.tsx`, `StudentRegistrationDialog.tsx`: Used in dashboards for displaying and managing links/registrations
  - `ui/`: Shadcn UI components (e.g., `card.tsx`, `button.tsx`, `dialog.tsx`) used throughout the app for consistent UI

- **Data Flow Example (Student Registration):**
  1. Student logs in via `AuthPage.tsx` → `AuthContext.jsx` stores user/token
  2. `StudentDashboard.tsx` fetches links via `linksAPI.getStudentLinks()` and submissions via `submissionsAPI.getMySubmissions()`
  3. When registering, `StudentRegistrationDialog.tsx` calls `submissionsAPI.create()`
  4. API utility sends JWT token in headers, backend verifies and processes
  5. UI updates via state and context

### Backend (backend/)

- **server.js**: Main entry, sets up Express app, connects to MongoDB, mounts all routes, and applies middleware.
  - Imports: `config/database.js`, all `routes/`, `middleware/`

- **config/database.js**: Handles MongoDB connection using Mongoose.

- **routes/**: Each file defines Express routes for a resource (e.g., `auth.js`, `links.js`, `submissions.js`).
  - Each route imports its controller and relevant middleware (e.g., `auth.js` uses `authController.js` and `auth.js` middleware)

- **controllers/**: Business logic for each resource. Receives requests from routes, interacts with models, and sends responses.
  - `authController.js`: Handles login, registration, JWT
  - `linkController.js`: Handles link CRUD, filtering by user role
  - `submissionController.js`: Handles student submissions, faculty/admin verification
  - `analyticsController.js`: Aggregates stats for dashboards

- **models/**: Mongoose schemas for each collection (User, Link, Submission, LoginStat, StudentLink).
  - Used by controllers to query/update MongoDB

- **middleware/**: Express middleware for authentication (`auth.js`), role checks (`roleCheck.js`), file uploads, etc.
  - Used in routes to protect endpoints and enforce permissions

- **utils/fileUpload.js**: Multer config for handling file uploads (screenshots)

- **uploads/**: Directory for storing uploaded files (if not using S3 or similar)

- **Data Flow Example (Faculty Creates Link):**
  1. Faculty logs in, receives JWT
  2. In dashboard, uses `CreateLinkDialog.tsx` to submit new link
  3. `linksAPI.create()` sends POST to `/api/links` with JWT
  4. `linkController.js` validates, saves to MongoDB via `Link.js` model, sets `createdBy` to faculty user
  5. Response sent back, UI updates

### Cross-Cutting Connections

- **Authentication**: JWT is issued on login (`authController.js`), stored in localStorage, sent with every API call via `api.jsx`, verified by `middleware/auth.js` on backend
- **Role-Based Access**: Enforced in backend routes via `roleCheck.js` and in frontend by showing/hiding UI based on `AuthContext.user.role`
- **API Error Handling**: All API calls in `api.jsx` handle errors and fallback to mock data if backend is unavailable
- **Documentation**: Markdown files in `/markdowns` provide architecture, setup, and testing guides

---

# LinkConnect - Project Structure & Architecture

## Overview
LinkConnect is a professional college placement registration platform with MongoDB database integration, role-based authentication, and comprehensive data management.

## Technology Stack

### Frontend
- **Framework**: React (TypeScript/JSX)
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Notifications**: Sonner
- **State Management**: React Context API

### Backend
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
link-connect/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── exportController.js
│   │   ├── linkController.js
│   │   ├── submissionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── Link.js
│   │   ├── LoginStat.js
│   │   ├── StudentLink.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── export.js
│   │   ├── links.js
│   │   ├── submissions.js
│   │   └── users.js
│   ├── server.js
│   ├── SETUP_DONE.md
│   └── utils/
│       └── fileUpload.js
├── src/
│   ├── components/
│   │   ├── CreateLinkDialog.tsx
│   │   ├── LinkCard.tsx
│   │   ├── LoginForm.jsx
│   │   ├── Navbar.jsx / Navbar.tsx
│   │   ├── RegisterForm.jsx
│   │   ├── StudentRegistrationDialog.tsx
│   │   └── ui/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── guidelines/
│   ├── mock-data/
│   ├── pages/
│   │   ├── AdminDashboard.tsx
│   │   ├── AuthPage.tsx
│   │   ├── FacultyDashboard.tsx
│   │   ├── ProfilePage.tsx
│   │   └── StudentDashboard.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── utils/
│   │   └── api.jsx
│   ├── App.jsx / App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite.config.ts
├── markdowns/
│   └── (documentation files)
├── index.html
├── package.json
├── start-dev.ps1
├── test-link.ps1
├── todo.md
└── vite.config.ts
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
- `GET /api/links` - Get all links (admin) or own links (faculty)
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Submissions (All roles)
- `POST /api/submissions` - Create submission (Student)
- `GET /api/submissions/link/:linkId` - Get by link (Faculty/Admin)
- `GET /api/submissions/student/:studentId` - Get by student
- `PUT /api/submissions/:id/verify` - Verify submission (Faculty/Admin)
- `GET /api/submissions/my` - Get current user's submissions (Student)

### Analytics (Admin & Faculty)
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

### Backend Setup
```bash
cd backend
npm install
# Create .env file with MongoDB URI and other secrets
npm run dev
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

**Last Updated**: December 11, 2025  
**Version**: 1.0.1  
**Maintained By**: LinkConnect Development Team

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
