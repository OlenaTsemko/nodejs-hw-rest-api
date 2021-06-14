const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscriptionUser,
  updateAvatar,
  verify,
  repeatSendVerifyEmail,
} = require('../../controllers/users');
const {
  validateSignupUser,
  validateLoginUser,
  validateUpdateSubscriptionUser,
  validateRepeatSendVerifyEmail,
} = require('../../validation/users');
const guard = require('../../helpers/guard');
const { createAccountLimiter } = require('../../helpers/limiter');
const upload = require('../../helpers/upload');

router
  .get('/current', guard, getCurrentUser)
  .get('/verify/:verificationToken', verify)
  .post('/verify', validateRepeatSendVerifyEmail, repeatSendVerifyEmail)
  .post('/signup', createAccountLimiter, validateSignupUser, signup)
  .post('/login', validateLoginUser, login)
  .post('/logout', guard, logout)
  .patch('/', guard, validateUpdateSubscriptionUser, updateSubscriptionUser)
  .patch('/avatars', guard, upload.single('avatar'), updateAvatar);

module.exports = router;
