const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken, requireRole('STORE_OWNER'));

router.get('/stores', ownerController.getOwnerStores);
router.get('/stores/:storeId/ratings', ownerController.getStoreRatings);

module.exports = router;
