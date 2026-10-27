const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, storeController.getStoresForUsers);
router.get('/:id', optionalAuth, storeController.getStoreById);

module.exports = router;
