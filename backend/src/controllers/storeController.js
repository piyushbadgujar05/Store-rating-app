const db = require('../config/db');
const { validateId } = require('../utils/validators');

const STORE_SORT_KEYS = {
  name: 's.name',
  address: 's.address',
  rating: 'overall_rating',
  created_at: 's.created_at',
};

async function getStoresForUsers(req, res, next) {
  try {
    const {
      search,
      name,
      address,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const sortColumn = STORE_SORT_KEYS[sortBy] || 's.name';
    const sortDirection = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.address ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (name) {
      conditions.push(`s.name ILIKE $${idx++}`);
      params.push(`%${name}%`);
    }

    if (address) {
      conditions.push(`s.address ILIKE $${idx++}`);
      params.push(`%${address}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM stores s ${where}`;
    const countRes = await db.query(countSql, params);
    const totalRecords = countRes.rows[0].total;

    const querySql = `
      SELECT 
        s.id,
        s.name,
        s.address,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
        COUNT(r.id)::int AS total_ratings,
        MAX(CASE WHEN r.user_id = $${idx++} THEN r.rating ELSE NULL END) AS my_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${where}
      GROUP BY s.id
      ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const { rows } = await db.query(querySql, [...params, currentUserId, limitNum, offset]);

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

async function getStoreById(req, res, next) {
  try {
    const { id } = req.params;
    const idCheck = validateId(id, 'Store ID');
    if (!idCheck.valid) {
      return res.status(400).json({ success: false, message: idCheck.message });
    }

    const currentUserId = req.user ? req.user.id : null;

    const querySql = `
      SELECT 
        s.id,
        s.name,
        s.address,
        s.email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
        COUNT(r.id)::int AS total_ratings,
        MAX(CASE WHEN r.user_id = $1 THEN r.rating ELSE NULL END) AS my_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $2
      GROUP BY s.id
    `;

    const { rows } = await db.query(querySql, [currentUserId, idCheck.value]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStoresForUsers,
  getStoreById,
};
