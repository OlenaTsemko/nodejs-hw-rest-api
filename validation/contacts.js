const Joi = require('joi');
const { httpCode } = require('../helpers/constants');

const schemaAddContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
  phone: Joi.string().min(10).max(14).required(),
  isImportant: Joi.boolean().optional(),
});

const schemaUpdateContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).optional(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .optional(),
  phone: Joi.string().min(10).max(14).optional(),
  isImportant: Joi.boolean().optional(),
}).min(1);

const schemaUpdateStatusContact = Joi.object({
  isImportant: Joi.boolean().required(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    next({
      status: httpCode.BAD_REQUEST,
      message: `Field: ${error.message.replace(/"/g, '')}`,
    });
  }
};

module.exports.validateAddContact = (req, res, next) => {
  return validate(schemaAddContact, req.body, next);
};

module.exports.validateUpdateContact = (req, res, next) => {
  return validate(schemaUpdateContact, req.body, next);
};

module.exports.validateUpdateStatusContact = (req, res, next) => {
  return validate(schemaUpdateStatusContact, req.body, next);
};
