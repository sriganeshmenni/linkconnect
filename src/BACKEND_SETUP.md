# LinkConnect Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Basic knowledge of Express.js

## Step 1: Create Backend Project

```bash
mkdir linkconnect-backend
cd linkconnect-backend
npm init -y
```

## Step 2: Install Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer exceljs express-rate-limit helmet
npm install --save-dev nodemon
```

## Step 3: Project Structure

Create the following structure:

```
linkconnect-backend/
├── server.js
├── .env
├── .gitignore
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Link.js
│   ├── Submission.js
│   └── LoginStat.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── links.js
│   ├── submissions.js
│   ├── analytics.js
│   └── export.js
├── middleware/
│   ├── auth.js
│   └── roleCheck.js
└── controllers/
    ├── authController.js
    ├── userController.js
    ├── linkController.js
    ├── submissionController.js
    └── analyticsController.js
```

## Step 4: Create .env File

```env
MONGODB_URI=mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/linkconnect?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Step 5: Create .gitignore

```
node_modules/
.env
uploads/
*.log
.DS_Store
```

## Step 6: Database Configuration

**File: config/database.js**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## Step 7: User Model

**File: models/User.js**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true
  },
  rollNumber: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

## Step 8: Link Model

**File: models/Link.js**

```javascript
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
  },
  deadline: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByEmail: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  registrations: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Link', linkSchema);
```

## Step 9: Submission Model

**File: models/Submission.js**

```javascript
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified'],
    default: 'completed'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
```

## Step 10: Auth Middleware

**File: middleware/auth.js**

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
```

**File: middleware/roleCheck.js**

```javascript
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

module.exports = roleCheck;
```

## Step 11: Auth Routes

**File: routes/auth.js**

```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ name, email, password, role, rollNumber });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    // Check if active
    if (!user.active) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Step 12: Server Setup

**File: server.js**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/links', require('./routes/links'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

## Step 13: Update package.json

Add this to scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## Step 14: Run the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

## Step 15: Test the API

Use Postman or curl to test:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@college.edu","password":"Test@123","role":"student","rollNumber":"CS2023001"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@college.edu","password":"Test@123","role":"student"}'
```

## Next Steps

1. Implement remaining routes (users, links, submissions, analytics, export)
2. Add data validation with express-validator
3. Implement file upload for screenshots
4. Add Excel export functionality
5. Deploy to production (Heroku/Render/Railway)

## Common Issues

**Issue**: MongoDB connection timeout
**Solution**: Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)

**Issue**: CORS errors
**Solution**: Verify FRONTEND_URL in .env matches your frontend URL

**Issue**: JWT errors
**Solution**: Ensure JWT_SECRET is set and is a strong random string

---

For complete route implementations, refer to the full backend repository.
