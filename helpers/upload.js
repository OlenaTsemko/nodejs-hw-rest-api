const multer = require('multer');
require('dotenv').config();
const { fileSizeLimit } = require('../config/rate-limit.json');
const { HttpCode } = require('../helpers/constants');

const UPLOAD_DIR = process.env.UPLOAD_DIR;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
      return;
    }
    const error = new Error('Please upload an image');
    error.status = HttpCode.BAD_REQUEST;
    cb(error);
  },
});

module.exports = upload;
