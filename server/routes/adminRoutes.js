const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers } = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/stats', verifyToken, checkRole('admin'), getDashboardStats);
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);

module.exports = router;