const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.post('/', requireRole('USER'), ratingController.submitRating);
router.put('/:storeId', requireRole('USER'), ratingController.updateRating);
router.get('/:storeId', ratingController.getUserStoreRating);

module.exports = router;
