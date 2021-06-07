const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');

require('dotenv').config();

const usersModel = require('../model/users');
const { HttpCode } = require('../helpers/constants');
// const UploadAvatar = require('../services/upload-avatars-static'); // статика
const UploadAvatar = require('../services/upload-avatars-cloud');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const AVATARS_DIR = path.join('public', process.env.AVATARS_DIR); // статика

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
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
    const { id, email, subscription, avatarURL } = newUser;

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: { id, email, subscription, avatarURL },
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
    const { email, subscription, avatarURL } = req.user;
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { email, subscription, avatarURL },
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await usersModel.updateUser(id, req.body);

    const { email, subscription } = user;

    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { email, subscription },
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

    // Статика
    // const uploads = new UploadAvatar(AVATARS_DIR);

    // const avatarUrl = await uploads.saveAvatarToStatic({
    //   idUser: id,
    //   pathFile: req.file.path,
    //   nameFile: req.file.filename,
    //   oldFile: req.user.avatarURL,
    // });
    // const user = await usersModel.updateAvatar(id, avatarUrl);

    // Cloudinary
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

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscriptionUser,
  updateAvatar,
};
