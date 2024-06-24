const path = require('path');
const express = require('express');
const rootDir = require('../utils/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('shop', {prods: adminData.products, pageTitle: 'Shop', path: '/'});
});

module.exports = router;
