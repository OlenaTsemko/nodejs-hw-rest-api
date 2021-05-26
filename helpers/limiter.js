const rateLimit = require('express-rate-limit');
const { HttpCode } = require('./constants');
const { apiLimit, createAccountLimit } = require('../config/rate-limit.json');

const limiter = rateLimit({
  windowMs: apiLimit.windowMs, // 15*60*1000 = 15 minutes
  max: apiLimit.max, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    next({
      status: HttpCode.BAD_REQUEST,
      message: 'Too many requests, please try again later',
    });
  },
});

const createAccountLimiter = rateLimit({
  windowMs: createAccountLimit.windowMs, // 60*60*1000 = 1 hour
  max: createAccountLimit.max, // start blocking after 2 requests
  handler: (req, res, next) => {
    next({
      status: HttpCode.BAD_REQUEST,
      message:
        'Your IP has reached the account creation limit within an hour, please try again later',
    });
  },
});

module.exports = { limiter, createAccountLimiter };
