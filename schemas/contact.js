const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 70,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 14,
      required: [true, "Set contact's phone number"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },

  {
    versionKey: false,
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },

    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

contactSchema.path('name').validate(value => {
  const re = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/;
  return re.test(String(value));
});

const Contact = mongoose.model('contact', contactSchema);

module.exports = Contact;
