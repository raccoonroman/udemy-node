const express = require('express');
const {
  getAddProductPage,
  postAddProduct,
} = require('../controllers/products');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', getAddProductPage);

// /admin/add-product => POST
router.post('/add-product', postAddProduct);

module.exports = router;
