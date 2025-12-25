const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role active tokenVersion');

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Account inactive or missing' });
    }

    if (user.tokenVersion !== (decoded.tokenVersion ?? 0)) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
