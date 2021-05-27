const Contact = require('../schemas/contact');

const listContacts = async (userId, query) => {
  const {
    limit = 20, // ?limit=10&offset=10&page=2
    offset = 0,
    page = 1,
    sortBy, // sortBy=name
    sortByDesc, // sortByDesc=name
    filter, // filter=name|email|phone|favorite
    favorite = null, // favorite=true
  } = query;

  const optionSearch = { owner: userId };

  // console.log('favorite', Boolean(favorite));
  if (favorite !== null) {
    optionSearch.favorite = favorite;
  }

  const results = await Contact.paginate(optionSearch, {
    limit,
    offset,
    page,
    select: filter ? filter.split('|').join(' ') : '',
    sort: {
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
    },
    populate: {
      path: 'owner',
      select: 'email subscription -_id',
    },
  });

  const { docs: contacts, totalDocs: total } = results;

  // const results = await Contact.find({ owner: userId }).populate({
  //   path: 'owner',
  //   select: 'email subscription -_id',
  // });
  return {
    contacts,
    total,
    limit: Number(limit),
    offset: Number(offset),
    page: Number(page),
  };
};

const getContactById = async (userId, contactId) => {
  const result = await Contact.findOne({
    _id: contactId,
    owner: userId,
  }).populate({ path: 'owner', select: 'email subscription ' });

  // const result = await Contact.findById({
  //   _id: contactId,
  //   owner: userId,
  // }).populate({ path: 'owner', select: 'email subscription ' });
  return result;
};

const removeContact = async (userId, contactId) => {
  const result = await Contact.findOneAndRemove({
    _id: contactId,
    owner: userId,
  });

  // const result = await Contact.findByIdAndRemove({
  //   _id: contactId,
  //   owner: userId,
  // });
  return result;
};

const addContact = async body => {
  const result = await Contact.create(body);
  return result;
};

const updateContact = async (userId, contactId, body) => {
  const result = await Contact.findOneAndUpdate(
    {
      _id: contactId,
      owner: userId,
    },
    { ...body },
    { new: true },
  );
  return result;
};

//   const result = await Contact.findByIdAndUpdate(
//     {
//       _id: contactId,
//       owner: userId,
//     },
//     { ...body },
//     { new: true },
//   );
//   return result;
// };

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
