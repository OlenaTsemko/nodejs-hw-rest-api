const express = require('express');
const router = express.Router();

const contactsModel = require('../../model/contacts');
const { httpCode } = require('../../helpers/constants');
const {
  validateAddContact,
  validateUpdateContact,
  validateUpdateStatusContact,
  validateId,
} = require('../../validation/contacts');

router.get('/', async (_req, res, next) => {
  try {
    const contacts = await contactsModel.listContacts();

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: { contacts },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', validateId, async (req, res, next) => {
  try {
    const contact = await contactsModel.getContactById(req.params.contactId);

    if (contact) {
      return res.status(httpCode.OK).json({
        status: 'success',
        code: httpCode.OK,
        data: { contact },
      });
    } else {
      return next({
        status: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', validateAddContact, async (req, res, next) => {
  try {
    const newContact = await contactsModel.addContact(req.body);

    return res.status(httpCode.CREATED).json({
      status: 'success',
      code: httpCode.CREATED,
      data: { newContact },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', validateId, async (req, res, next) => {
  try {
    const contact = await contactsModel.removeContact(req.params.contactId);

    if (contact) {
      return res.status(httpCode.OK).json({
        status: 'success',
        code: httpCode.OK,
        message: 'Contact Deleted',
        data: { contact },
      });
    } else {
      return next({
        status: httpCode.NOT_FOUND,
        message: 'Contact Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:contactId',
  validateUpdateContact,
  validateId,
  async (req, res, next) => {
    try {
      const contact = await contactsModel.updateContact(
        req.params.contactId,
        req.body,
      );

      if (contact) {
        return res.status(httpCode.OK).json({
          status: 'success',
          code: httpCode.OK,
          data: { contact },
        });
      } else {
        return next({
          status: httpCode.NOT_FOUND,
          message: 'Contact Not Found',
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:contactId/favorite',
  validateUpdateStatusContact,
  validateId,
  async (req, res, next) => {
    try {
      const contact = await contactsModel.updateContact(
        req.params.contactId,
        req.body,
      );

      if (contact) {
        return res.status(httpCode.OK).json({
          status: 'success',
          code: httpCode.OK,
          data: { contact },
        });
      } else {
        return next({
          status: httpCode.NOT_FOUND,
          message: 'Contact Not Found',
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
