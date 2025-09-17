const express = require('express');
const productRoutes = require('./productRoutes');
const geminiRoutes = require('./geminiRoutes');
const router = express.Router();

router.use('/products', productRoutes);
router.use('/ai-summary', geminiRoutes);

module.exports = router;
