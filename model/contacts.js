const Contact = require('../schemas/contact');

const listContacts = async () => {
  const results = await Contact.find({});
  return results;
};

const getContactById = async contactId => {
  const result = await Contact.findById(contactId);
  return result;
};

const removeContact = async contactId => {
  const result = await Contact.findByIdAndRemove(contactId);
  return result;
};

const addContact = async body => {
  const result = await Contact.create(body);
  return result;
};

const updateContact = async (contactId, body) => {
  const result = await Contact.findByIdAndUpdate(
    contactId,
    { ...body },
    { new: true },
  );
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

// MongoDB
// const { ObjectID } = require('mongodb');
// const db = require('./db');

// const getCollection = async (db, name) => {
//   const client = await db;
//   const collection = await client.db().collection(name);
//   return collection;
// };

// const listContacts = async () => {
//   const collection = await getCollection(db, 'contacts');
//   const results = await collection.find({}).toArray();
//   return results;
// };

// const getContactById = async contactId => {
//   const collection = await getCollection(db, 'contacts');
//   const [result] = await collection
//     .find({ _id: new ObjectID(contactId) })
//     .toArray();
//   return result;
// };

// const removeContact = async contactId => {
//   const collection = await getCollection(db, 'contacts');
//   const { value: result } = await collection.findOneAndDelete({
//     _id: new ObjectID(contactId),
//   });
//   return result;
// };

// const addContact = async body => {
//   const collection = await getCollection(db, 'contacts');
//   const record = {
//     ...body,
//     ...(body.favorite ? {} : { favorite: false }),
//   };
//   const {
//     ops: [result],
//   } = await collection.insertOne(record);
//   return result;
// };

// const updateContact = async (contactId, body) => {
//   const collection = await getCollection(db, 'contacts');
//   const { value: result } = await collection.findOneAndUpdate(
//     { _id: new ObjectID(contactId) },
//     { $set: body },
//     { returnOriginal: false },
//   );
//   return result;
// };

// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };
