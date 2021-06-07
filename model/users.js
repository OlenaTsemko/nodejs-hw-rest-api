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

// статика
// const updateAvatar = async (id, avatarUrl) => {
//   return await User.findByIdAndUpdate(id, { avatarURL: avatarUrl });
// };

// cloudinary
const updateAvatar = async (id, avatarUrl, userIdImg = null) => {
  return await User.findByIdAndUpdate(id, { avatarURL: avatarUrl, userIdImg });
};

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  updateUser,
  updateAvatar,
};
