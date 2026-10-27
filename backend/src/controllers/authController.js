const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_store_app';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

function createToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, address, password } = req.body;

    const checkName = validateName(name);
    if (!checkName.valid) {
      return res.status(400).json({ success: false, message: checkName.message });
    }

    const checkEmail = validateEmail(email);
    if (!checkEmail.valid) {
      return res.status(400).json({ success: false, message: checkEmail.message });
    }

    const checkAddress = validateAddress(address);
    if (!checkAddress.valid) {
      return res.status(400).json({ success: false, message: checkAddress.message });
    }

    const checkPass = validatePassword(password);
    if (!checkPass.valid) {
      return res.status(400).json({ success: false, message: checkPass.message });
    }

    const { rows: existingUsers } = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [checkEmail.value]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, address, role, created_at`,
      [checkName.value, checkEmail.value, checkAddress.value, hash]
    );

    const newUser = rows[0];
    const token = createToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await db.query(
      'SELECT id, name, email, address, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const account = rows[0];
    const isMatch = await bcrypt.compare(password, account.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = createToken(account);

    const profile = {
      id: account.id,
      name: account.name,
      email: account.email,
      address: account.address,
      role: account.role,
      created_at: account.created_at,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
};
