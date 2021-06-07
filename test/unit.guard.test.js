const passport = require('passport');

const guard = require('../helpers/guard');
const { HttpCode } = require('../helpers/constants');

describe('Unit test guard', () => {
  let user, req, res, next;

  beforeEach(() => {
    user = { token: '0000' };
    req = { get: jest.fn(header => `Bearer ${user.token}`), user };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(data => data),
    };
    next = jest.fn(err => {
      if (err) {
        const code = err.status || HttpCode.INTERNAL_SERVER_ERROR;
        const status = err.status ? 'error' : 'fail';

        return res.status(code).json({
          status,
          code,
          message: err.message,
        });
      }
    });
  });

  it('run guard with valid token', async () => {
    passport.authenticate = jest.fn(
      (strategy, options, callback) => (req, res, next) => {
        callback(null, user);
      },
    );
    guard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('run guard without token', async () => {
    passport.authenticate = jest.fn(
      (strategy, options, callback) => (req, res, next) => {
        callback(null, false);
      },
    );
    guard(req, res, next);
    expect(req.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(next).toHaveReturnedWith({
      code: HttpCode.UNAUTHORIZED,
      status: 'error',
      message: 'Not authorized',
    });
    // expect(res.status).toHaveBeenCalled();
    // expect(res.json).toHaveBeenCalled();
    // expect(res.json).toHaveReturnedWith({
    //   status: 'error',
    //   code: HttpCode.UNAUTHORIZED,
    //   message: 'Not authorized',
    // });
  });

  it('run guard with wrong token', async () => {
    passport.authenticate = jest.fn(
      (strategy, options, callback) => (req, res, next) => {
        callback(null, { token: '1234' });
      },
    );
    guard(req, res, next);
    expect(req.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(next).toHaveReturnedWith({
      code: HttpCode.UNAUTHORIZED,
      status: 'error',
      message: 'Not authorized',
    });
    // expect(res.status).toHaveBeenCalled();
    // expect(res.json).toHaveBeenCalled();
    // expect(res.json).toHaveReturnedWith({
    //   status: 'error',
    //   code: HttpCode.UNAUTHORIZED,
    //   message: 'Not authorized',
    // });
  });

  it('run guard with error', async () => {
    passport.authenticate = jest.fn(
      (strategy, options, callback) => (req, res, next) => {
        callback(new Error('Error'), {});
      },
    );
    guard(req, res, next);
    expect(req.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(next).toHaveReturnedWith({
      code: HttpCode.UNAUTHORIZED,
      status: 'error',
      message: 'Not authorized',
    });
    // expect(res.status).toHaveBeenCalled();
    // expect(res.json).toHaveBeenCalled();
    // expect(res.json).toHaveReturnedWith({
    //   status: 'error',
    //   code: HttpCode.UNAUTHORIZED,
    //   message: 'Not authorized',
    // });
  });
});
