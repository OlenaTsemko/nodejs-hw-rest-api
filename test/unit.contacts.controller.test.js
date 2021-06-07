const contacts = require('../controllers/contacts');
const contactsModel = require('../model/contacts');
const { HttpCode } = require('../helpers/constants');

jest.mock('../model/contacts');

describe('unit test contacts controllers', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { id: 1 }, body: {}, params: { id: 3 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(data => data),
    };
    next = jest.fn(err => {
      const code = err.status || HttpCode.INTERNAL_SERVER_ERROR;
      const status = err.status ? 'error' : 'fail';

      return res.status(code).json({
        status,
        code,
        message: err.message,
      });
    });
  });

  describe('should get contacts list', () => {
    test('get contacts list success', async () => {
      contactsModel.listContacts = jest.fn(() => true);
      const result = await contacts.getContactsList(req, res, next);

      expect(contactsModel.listContacts).toHaveBeenCalled();
      expect(result.status).toEqual('success');
      expect(result.code).toEqual(HttpCode.OK);
    });

    test('DB return an exception', async () => {
      contactsModel.listContacts = jest.fn(() => {
        throw new Error('Error');
      });
      await contacts.getContactsList(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('should get a contact by id', () => {
    test('contact is not exist in DB', async () => {
      contactsModel.getContactById = jest.fn();
      await contacts.getContactById(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveReturnedWith({
        code: HttpCode.NOT_FOUND,
        status: 'error',
        message: 'Not Found',
      });
    });

    test('DB return an exception', async () => {
      contactsModel.getContactById = jest.fn(() => {
        throw new Error('Error');
      });
      await contacts.getContactById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('should create a new contact', () => {
    test('DB return an exception', async () => {
      contactsModel.addContact = jest.fn(() => {
        throw new Error('Error');
      });
      await contacts.addContact(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('should remove a contact by id', () => {
    test('contact not is exist in DB', async () => {
      contactsModel.removeContact = jest.fn();
      await contacts.removeContact(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveReturnedWith({
        code: HttpCode.NOT_FOUND,
        status: 'error',
        message: 'Contact Not Found',
      });
    });

    test('DB return an exception', async () => {
      contactsModel.removeContact = jest.fn(() => {
        throw new Error('Error');
      });
      await contacts.removeContact(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('should update a contact by id', () => {
    test('contact success update', async () => {
      contactsModel.updateContact = jest.fn(() => true);
      const result = await contacts.updateContact(req, res, next);

      expect(contactsModel.updateContact).toHaveBeenCalled();
      expect(result.status).toEqual('success');
      expect(result.code).toEqual(HttpCode.OK);
    });

    test('contact is not exist in DB', async () => {
      contactsModel.updateContact = jest.fn();
      await contacts.updateContact(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveReturnedWith({
        code: HttpCode.NOT_FOUND,
        status: 'error',
        message: 'Contact Not Found',
      });
    });

    test('DB return an exception', async () => {
      contactsModel.updateContact = jest.fn(() => {
        throw new Error('Error');
      });
      await contacts.updateContact(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
