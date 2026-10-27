const db = require('../config/db');
const { validateId } = require('../utils/validators');

const RATING_SORT_FIELDS = {
  user_name: 'u.name',
  user_email: 'u.email',
  rating: 'r.rating',
  created_at: 'r.created_at',
  updated_at: 'r.updated_at',
};

async function getOwnerStores(req, res, next) {
  try {
    const ownerId = req.user.id;

    const querySql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS average_rating,
        COUNT(r.id)::int AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id
      ORDER BY s.name ASC
    `;

    const { rows } = await db.query(querySql, [ownerId]);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
}

async function getStoreRatings(req, res, next) {
  try {
    const ownerId = req.user.id;
    const { storeId } = req.params;

    const idCheck = validateId(storeId, 'Store ID');
    if (!idCheck.valid) {
      return res.status(400).json({ success: false, message: idCheck.message });
    }

    const {
      sortBy = 'updated_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const { rows: storeRows } = await db.query(
      'SELECT id, name, email, address FROM stores WHERE id = $1 AND owner_id = $2',
      [idCheck.value, ownerId]
    );

    if (storeRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view ratings for this store.',
      });
    }

    const store = storeRows[0];

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const sortCol = RATING_SORT_FIELDS[sortBy] || 'r.updated_at';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countSql = 'SELECT COUNT(*)::int AS total FROM ratings WHERE store_id = $1';
    const countRes = await db.query(countSql, [idCheck.value]);
    const totalRecords = countRes.rows[0].total;

    const ratingsSql = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $2 OFFSET $3
    `;

    const { rows: ratings } = await db.query(ratingsSql, [idCheck.value, limitNum, offset]);

    const avgRes = await db.query(
      'SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS avg_rating FROM ratings WHERE store_id = $1',
      [idCheck.value]
    );

    res.status(200).json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: avgRes.rows[0].avg_rating,
        totalRatings: totalRecords,
      },
      data: ratings,
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

module.exports = {
  getOwnerStores,
  getStoreRatings,
};
