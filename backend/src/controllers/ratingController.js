const db = require('../config/db');
const { validateRating, validateId } = require('../utils/validators');

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

async function submitRating(req, res, next) {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const idCheck = validateId(storeId, 'Store ID');
    if (!idCheck.valid) {
      return res.status(400).json({ success: false, message: idCheck.message });
    }

    const check = validateRating(rating);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const { rows: storeRows } = await db.query('SELECT id FROM stores WHERE id = $1', [idCheck.value]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const upsertSql = `
      INSERT INTO ratings (user_id, store_id, rating, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, store_id, rating, created_at, updated_at
    `;

    const { rows } = await db.query(upsertSql, [userId, idCheck.value, check.value]);
    const summary = await getStoreSummary(idCheck.value, userId);

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

async function updateRating(req, res, next) {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const idCheck = validateId(storeId, 'Store ID');
    if (!idCheck.valid) {
      return res.status(400).json({ success: false, message: idCheck.message });
    }

    const check = validateRating(rating);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const { rows: existing } = await db.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, idCheck.value]
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

    const { rows } = await db.query(updateSql, [check.value, userId, idCheck.value]);
    const summary = await getStoreSummary(idCheck.value, userId);

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

async function getUserStoreRating(req, res, next) {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const idCheck = validateId(storeId, 'Store ID');
    if (!idCheck.valid) {
      return res.status(400).json({ success: false, message: idCheck.message });
    }

    const { rows } = await db.query(
      'SELECT rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, idCheck.value]
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
