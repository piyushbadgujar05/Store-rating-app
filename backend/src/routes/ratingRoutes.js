const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', ratingController.submitRating);
router.put('/:storeId', ratingController.updateRating);
router.get('/:storeId', ratingController.getUserStoreRating);

module.exports = router;
