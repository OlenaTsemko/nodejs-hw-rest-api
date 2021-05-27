const mongoose = require('mongoose');
const { Schema } = mongoose;

const bcrypt = require('bcryptjs');
const SALT_FACTOR = 6;

const { Subscription } = require('../helpers/constants');

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      // validate(value) {
      //   const re = /\S+@\S+\.\S+/gi;
      //   return re.test(String(value).toLowerCase());
      // },
    },
    subscription: {
      type: String,
      enum: [Subscription.STARTER, Subscription.PRO, Subscription.BUSINESS],
      default: Subscription.STARTER,
    },
    token: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

userSchema.path('email').validate(value => {
  const re = /\S+@\S+\.\S+/gi;
  return re.test(String(value).toLowerCase());
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
}); // pre - вызываем перед сохранением ('save')

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(String(password), this.password);
}; // сравниваем 2 значения или это тот же пароль

const User = mongoose.model('user', userSchema);

module.exports = User;
