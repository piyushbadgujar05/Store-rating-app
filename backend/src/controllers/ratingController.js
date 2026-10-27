const db = require('../config/db');
const { validateRating } = require('../utils/validators');

// Helper to fetch the latest overall store average and the user's rating
async function getStoreSummary(storeId, userId) {
  const { rows } = await db.query(
    `SELECT 
      s.id AS store_id,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
      COUNT(r.id)::int AS total_ratings,
      MAX(CASE WHEN r.user_id = $1 THEN r.rating ELSE NULL END) AS my_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.id = $2
    GROUP BY s.id`,
    [userId, storeId]
  );
  return rows[0];
}

// Submit a rating (creates new or updates existing)
async function submitRating(req, res, next) {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId is required.' });
    }

    const check = validateRating(rating);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    // Make sure the store exists
    const { rows: storeRows } = await db.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Insert or update rating if already submitted by this user
    const upsertSql = `
      INSERT INTO ratings (user_id, store_id, rating, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, store_id, rating, created_at, updated_at
    `;

    const { rows } = await db.query(upsertSql, [userId, storeId, check.value]);
    const summary = await getStoreSummary(storeId, userId);

    res.status(200).json({
      success: true,
      message: 'Rating saved successfully.',
      data: rows[0],
      storeSummary: summary,
    });
  } catch (err) {
    next(err);
  }
}

// Modify an already submitted rating
async function updateRating(req, res, next) {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const check = validateRating(rating);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const { rows: existing } = await db.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No previous rating found for this store. Please submit a new rating.',
      });
    }

    const updateSql = `
      UPDATE ratings
      SET rating = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND store_id = $3
      RETURNING id, user_id, store_id, rating, updated_at
    `;

    const { rows } = await db.query(updateSql, [check.value, userId, storeId]);
    const summary = await getStoreSummary(storeId, userId);

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: rows[0],
      storeSummary: summary,
    });
  } catch (err) {
    next(err);
  }
}

// Check if user already rated this store
async function getUserStoreRating(req, res, next) {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const { rows } = await db.query(
      'SELECT rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { rated: false, rating: null },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        rated: true,
        rating: rows[0].rating,
        updatedAt: rows[0].updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitRating,
  updateRating,
  getUserStoreRating,
};
