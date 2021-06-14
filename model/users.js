const User = require('../schemas/user');

const findById = async id => {
  return await User.findById(id);
};

const findByEmail = async email => {
  return await User.findOne({ email });
};

const create = async options => {
  const user = new User(options);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.findByIdAndUpdate(id, { token });
};

const updateUser = async (id, body) => {
  const result = await User.findByIdAndUpdate(id, { ...body }, { new: true });
  return result;
};

const updateAvatar = async (id, avatarUrl, userIdImg = null) => {
  return await User.findByIdAndUpdate(id, { userIdImg, avatarURL: avatarUrl });
};

const getUserByVerifyToken = async token => {
  return await User.findOne({ verifyToken: token });
};

const updateVerifyToken = async (id, verify = true, token = null) => {
  return await User.findByIdAndUpdate(id, { verify, verifyToken: token });
};

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  updateUser,
  updateAvatar,
  getUserByVerifyToken,
  updateVerifyToken,
};
