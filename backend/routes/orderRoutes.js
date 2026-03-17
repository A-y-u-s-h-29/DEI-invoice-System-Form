const express = require('express');
const router = express.Router();
const { createOrder, getOrderByNumber } = require('../controllers/orderController');

router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrderByNumber);

module.exports = router;