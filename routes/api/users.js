const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscriptionUser,
} = require('../../controllers/users');
const {
  validateSignupUser,
  validateLoginUser,
  validateUpdateSubscriptionUser,
} = require('../../validation/users');
const guard = require('../../helpers/guard');
const { createAccountLimiter } = require('../../helpers/limiter');

router
  .post('/signup', createAccountLimiter, validateSignupUser, signup)
  .post('/login', validateLoginUser, login)
  .post('/logout', guard, logout)
  .get('/current', guard, getCurrentUser)
  .patch('/', guard, validateUpdateSubscriptionUser, updateSubscriptionUser);

module.exports = router;
