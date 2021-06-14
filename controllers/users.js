const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
require('dotenv').config();

const usersModel = require('../model/users');
const { HttpCode } = require('../helpers/constants');
const UploadAvatar = require('../services/upload-avatars-cloud');
const EmailService = require('../services/email');
const {
  CreateSenderNodemailer,
  CreateSenderSendgrid,
} = require('../services/sender-email');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const signup = async (req, res, next) => {
  try {
    const user = await usersModel.findByEmail(req.body.email);

    if (user) {
      return next({
        status: HttpCode.CONFLICT,
        message: 'Email in use',
      });
    }

    const newUser = await usersModel.create(req.body);
    const { id, name, email, subscription, avatarURL, verifyToken } = newUser;
    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderSendgrid(),
      );

      await emailService.sendVerifyPasswordEmail(verifyToken, email, name);
    } catch (error) {
      console.log(error.message);
    }

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: { id, name, email, subscription, avatarURL },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersModel.findByEmail(email);

    const isValidPassword = await user?.validPassword(password);

    if (!user || !isValidPassword) {
      return next({
        status: HttpCode.UNAUTHORIZED,
        message: 'Email or password is wrong',
      });
    }

    if (!user.verify) {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'User not found',
      });
    }

    const { subscription } = user;

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '2h' });

    await usersModel.updateToken(user.id, token);

    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { token, user: { email, subscription } },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const id = req.user.id;
    await usersModel.updateToken(id, null);
    return res.status(HttpCode.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { name, email, subscription, avatarURL } = req.user;
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { name, email, subscription, avatarURL },
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await usersModel.updateUser(id, req.body);

    const { name, email, subscription } = user;

    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { name, email, subscription },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'User Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;

    const uploadCloud = promisify(cloudinary.uploader.upload);
    const uploads = new UploadAvatar(uploadCloud);
    const { userIdImg, avatarUrl } = await uploads.saveAvatarToCloud(
      req.file.path,
      req.user.userIdImg,
    );

    const user = await usersModel.updateAvatar(id, avatarUrl, userIdImg);

    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { avatarUrl },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'User Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await usersModel.getUserByVerifyToken(
      req.params.verificationToken,
    );

    if (user) {
      await usersModel.updateVerifyToken(user._id, true, null);

      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Verification successful',
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'User not found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const repeatSendVerifyEmail = async (req, res, next) => {
  const user = await usersModel.findByEmail(req.body.email);
  if (user) {
    const { name, email, verifyToken, verify } = user;
    if (!verify) {
      try {
        const emailService = new EmailService(
          process.env.NODE_ENV,
          new CreateSenderNodemailer(),
        );

        await emailService.sendVerifyPasswordEmail(verifyToken, email, name);
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          message: 'Verification email sent',
        });
      } catch (error) {
        console.log(error.message);
        return next(error);
      }
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: 'Verification has already been passed',
    });
  }
  return res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    message: 'User not found',
  });
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscriptionUser,
  updateAvatar,
  verify,
  repeatSendVerifyEmail,
};
