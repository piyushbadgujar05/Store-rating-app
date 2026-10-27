const bcrypt = require('bcryptjs');
const db = require('../config/db');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

// Map client-side sort keys to safe SQL column names
const STORE_SORT_FIELDS = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'avg_rating',
  ratings_count: 'rating_count',
  created_at: 's.created_at',
};

const USER_SORT_FIELDS = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  created_at: 'u.created_at',
};

// Summary metrics for the admin dashboard
async function getDashboardStats(req, res, next) {
  try {
    const userStatsQuery = db.query(`
      SELECT 
        COUNT(*)::int AS total_users,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END)::int AS admin_count,
        COUNT(CASE WHEN role = 'USER' THEN 1 END)::int AS normal_user_count,
        COUNT(CASE WHEN role = 'STORE_OWNER' THEN 1 END)::int AS store_owner_count
      FROM users
    `);

    const storeStatsQuery = db.query('SELECT COUNT(*)::int AS total_stores FROM stores');
    const ratingStatsQuery = db.query('SELECT COUNT(*)::int AS total_ratings FROM ratings');

    const [userRes, storeRes, ratingRes] = await Promise.all([
      userStatsQuery,
      storeStatsQuery,
      ratingStatsQuery,
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userRes.rows[0].total_users,
        userBreakdown: {
          admins: userRes.rows[0].admin_count,
          normalUsers: userRes.rows[0].normal_user_count,
          storeOwners: userRes.rows[0].store_owner_count,
        },
        totalStores: storeRes.rows[0].total_stores,
        totalRatings: ratingRes.rows[0].total_ratings,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Add a new store and optionally assign a store owner
async function createStore(req, res, next) {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, message: `Store ${nameCheck.message.toLowerCase()}` });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) {
      return res.status(400).json({ success: false, message: addressCheck.message });
    }

    // If an owner was selected, ensure that user exists and actually has the STORE_OWNER role
    let assignedOwnerId = null;
    if (ownerId) {
      const { rows } = await db.query('SELECT id, role, name FROM users WHERE id = $1', [ownerId]);
      if (rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Selected store owner was not found.' });
      }
      if (rows[0].role !== 'STORE_OWNER') {
        return res.status(400).json({
          success: false,
          message: `User ${rows[0].name} has the role "${rows[0].role}". Only users with the STORE_OWNER role can be assigned to stores.`,
        });
      }
      assignedOwnerId = rows[0].id;
    }

    // Check duplicate store email
    const { rows: existingStore } = await db.query('SELECT id FROM stores WHERE LOWER(email) = LOWER($1)', [emailCheck.value]);
    if (existingStore.length > 0) {
      return res.status(409).json({ success: false, message: 'A store with this email already exists.' });
    }

    const { rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [nameCheck.value, emailCheck.value, addressCheck.value, assignedOwnerId]
    );

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

// Add user with arbitrary role (ADMIN, USER, STORE_OWNER)
async function createUser(req, res, next) {
  try {
    const { name, email, address, password, role } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) {
      return res.status(400).json({ success: false, message: addressCheck.message });
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    const assignedRole = String(role || 'USER').toUpperCase();
    if (!allowedRoles.includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed values: ${allowedRoles.join(', ')}`,
      });
    }

    // Check duplicate email
    const { rows: existingUser } = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [emailCheck.value]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [nameCheck.value, emailCheck.value, addressCheck.value, hash, assignedRole]
    );

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

// Search, filter, sort, and paginate stores for admin view
async function listStores(req, res, next) {
  try {
    const {
      name,
      email,
      address,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const sortCol = STORE_SORT_FIELDS[sortBy] || 's.name';
    const sortDir = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];
    let idx = 1;

    if (name) {
      conditions.push(`s.name ILIKE $${idx++}`);
      params.push(`%${name}%`);
    }

    if (email) {
      conditions.push(`s.email ILIKE $${idx++}`);
      params.push(`%${email}%`);
    }

    if (address) {
      conditions.push(`s.address ILIKE $${idx++}`);
      params.push(`%${address}%`);
    }

    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.email ILIKE $${idx} OR s.address ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*)::int AS total FROM stores s ${where}`;
    const countRes = await db.query(countSql, params);
    const totalRecords = countRes.rows[0].total;

    // Fetch stores joined with owner info and rating averages
    const querySql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
        COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${where}
      GROUP BY s.id, u.name, u.email
      ORDER BY ${sortCol} ${sortDir} NULLS LAST
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const { rows } = await db.query(querySql, [...params, limitNum, offset]);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

// List users with role/text filters, sorting, and pagination
async function listUsers(req, res, next) {
  try {
    const {
      name,
      email,
      address,
      role,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const sortCol = USER_SORT_FIELDS[sortBy] || 'u.name';
    const sortDir = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];
    let idx = 1;

    if (name) {
      conditions.push(`u.name ILIKE $${idx++}`);
      params.push(`%${name}%`);
    }

    if (email) {
      conditions.push(`u.email ILIKE $${idx++}`);
      params.push(`%${email}%`);
    }

    if (address) {
      conditions.push(`u.address ILIKE $${idx++}`);
      params.push(`%${address}%`);
    }

    if (role) {
      conditions.push(`u.role = $${idx++}`);
      params.push(role.toUpperCase());
    }

    if (search) {
      conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.address ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM users u ${where}`;
    const countRes = await db.query(countSql, params);
    const totalRecords = countRes.rows[0].total;

    const querySql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        u.updated_at
      FROM users u
      ${where}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const { rows } = await db.query(querySql, [...params, limitNum, offset]);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

// User details inspection; if user is a store owner, attach their stores and ratings
async function getUserDetails(req, res, next) {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT id, name, email, address, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const profile = rows[0];
    let storeInfo = [];

    if (profile.role === 'STORE_OWNER') {
      const { rows: stores } = await db.query(
        `SELECT 
          s.id,
          s.name,
          s.email,
          s.address,
          COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
          COUNT(r.id)::int AS rating_count
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.owner_id = $1
        GROUP BY s.id
        ORDER BY s.name ASC`,
        [profile.id]
      );
      storeInfo = stores;
    }

    res.status(200).json({
      success: true,
      data: {
        ...profile,
        associatedStores: storeInfo,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Helper to populate owner dropdown options in the create store form
async function getStoreOwners(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email FROM users WHERE role = 'STORE_OWNER' ORDER BY name ASC`
    );
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  createStore,
  createUser,
  listStores,
  listUsers,
  getUserDetails,
  getStoreOwners,
};
