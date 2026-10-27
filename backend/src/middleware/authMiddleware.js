const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_store_app';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check if the user still exists in the database
    const { rows } = await db.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [payload.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: user account not found.',
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}

// Allows requests through whether logged in or not; attaches user if token is valid
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await db.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [payload.userId]
    );
    req.user = rows[0] || null;
  } catch {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};
