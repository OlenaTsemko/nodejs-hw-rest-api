const contactsModel = require('../model/contacts');
const { HttpCode } = require('../helpers/constants');

const getContactsList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { contacts, limit, offset, total, page } =
      await contactsModel.listContacts(userId, req.query);

    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { total, limit, offset, page, contacts },
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const contact = await contactsModel.getContactById(
      userId,
      req.params.contactId,
    );

    // условие чтоб использовать в model.contacts.js методы с ById, иначе есть доступ у другого пользователя по id контакта
    // if (userId !== String(contact?.owner._id)) {
    //   return next({
    //     status: HttpCode.NOT_FOUND,
    //     message: 'Not Found',
    //   });
    // }

    if (contact) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { contact },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newContact = await contactsModel.addContact({
      ...req.body,
      owner: userId,
    });

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: { newContact },
    });
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await contactsModel.removeContact(
      userId,
      req.params.contactId,
    );

    // if (userId !== String(contact?.owner._id)) {
    //   return next({
    //     status: HttpCode.NOT_FOUND,
    //     message: 'Not Found',
    //   });
    // }

    if (contact) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Contact Deleted',
        data: { contact },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'Contact Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await contactsModel.updateContact(
      userId,
      req.params.contactId,
      req.body,
    );

    // if (userId !== String(contact?.owner._id)) {
    //   return next({
    //     status: HttpCode.NOT_FOUND,
    //     message: 'Not Found',
    //   });
    // }

    if (contact) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { contact },
      });
    } else {
      return next({
        status: HttpCode.NOT_FOUND,
        message: 'Contact Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContactsList,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
