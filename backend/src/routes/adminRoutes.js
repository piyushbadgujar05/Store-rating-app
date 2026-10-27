const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/stores', adminController.listStores);
router.post('/stores', adminController.createStore);
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.get('/store-owners', adminController.getStoreOwners);

module.exports = router;
