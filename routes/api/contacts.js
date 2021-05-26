const express = require('express');
const router = express.Router();

const guard = require('../../helpers/guard');
const {
  getContactsList,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require('../../controllers/contacts');
const {
  validateAddContact,
  validateUpdateContact,
  validateUpdateStatusContact,
  validateId,
} = require('../../validation/contacts');

router
  .get('/', guard, getContactsList)
  .get('/:contactId', guard, validateId, getContactById)
  .post('/', guard, validateAddContact, addContact)
  .delete('/:contactId', guard, validateId, removeContact)
  .put('/:contactId', guard, validateId, validateUpdateContact, updateContact)
  .patch(
    '/:contactId/favorite',
    guard,
    validateId,
    validateUpdateStatusContact,
    updateContact,
  );

module.exports = router;
