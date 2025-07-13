// backend/middleware/auth.js

import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    req.userId = req.userId = decoded._id || decoded.id || decoded.userId;
    // contains userId, role, etc.
    // console.log('Token from cookie:', req.cookies.token);
    // console.log('User ID set to req.userId:', req.userId);

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied: incorrect role' });
    }
    next();
  };
};