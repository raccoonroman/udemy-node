const express = require('express');
const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((email, { req }) => {
        return User.findOne({ email }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              'Email already exists, please pick a different one'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    check('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
