const express = require('express');
const router = express.Router();
const {
  submitRequest,
  updateStatus,
  cancelRequest,
  getMyRequests,
  getRequestById,
} = require('../controllers/requestController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, getMyRequests);
router.get('/:id', verifyToken, getRequestById);
router.post('/', verifyToken, checkRole('customer'), submitRequest);
router.patch('/:id/status', verifyToken, checkRole('provider'), updateStatus);
router.patch('/:id/cancel', verifyToken, cancelRequest);

module.exports = router;