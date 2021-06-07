const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { newContact, newUser } = require('./data/data');
const app = require('../app');
const db = require('../model/db');
const Contact = require('../schemas/contact');
const User = require('../schemas/user');
const usersModel = require('../model/users');
const { HttpCode } = require('../helpers/constants');

describe('E2E test the routes api/contacts', () => {
  let user, token;

  beforeAll(async () => {
    await db;
    await User.deleteOne({ email: newUser.email });
    user = await usersModel.create(newUser);
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    const issueToken = (payload, secret) => jwt.sign(payload, secret);
    token = issueToken({ id: user._id }, JWT_SECRET_KEY);
    await usersModel.updateToken(user._id, token);
  });

  beforeEach(async () => {
    await Contact.deleteMany();
  });

  afterAll(async () => {
    const mongo = await db;
    await User.deleteOne({ email: newUser.email });
    await mongo.disconnect();
  });

  describe('should handle get request', () => {
    it('should response 200 status for get contacts list', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
      expect(res.body.data.contacts).toBeInstanceOf(Array);
    });

    it('should response 200 status for get contact by id', async () => {
      const contact = await Contact.create({ ...newContact, owner: user._id });

      const res = await request(app)
        .get(`/api/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
      expect(res.body.data.contact.id).toBe(String(contact._id));
    });

    it('should response 400 status for get contact by id', async () => {
      const res = await request(app)
        .get(`/api/contacts/123`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });
  });

  describe('should handle post request', () => {
    it('should response 201 status create new contact', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send(newContact);

      expect(res.status).toEqual(HttpCode.CREATED);
      expect(res.body).toBeDefined();
    });

    it('should response 400 status without required field phone', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ name: 'Bebe' });

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });
  });

  describe('should handle put request', () => {
    it('should response 200 status update contact', async () => {
      const contact = await Contact.create({
        ...newContact,
        owner: user._id,
      });

      const res = await request(app)
        .put(`/api/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ name: 'Koko' });

      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
      expect(res.body.data.contact.name).toBe('Koko');
    });

    it('should response 400 status for update contact with wrong id', async () => {
      const res = await request(app)
        .put(`/api/contacts/123`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ name: 'Koko' });

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });

    it('should response 400 status for update contact with empty fields', async () => {
      const contact = await Contact.create({
        ...newContact,
        owner: user._id,
      });

      const res = await request(app)
        .put(`/api/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({});

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });
  });

  describe('should handle patch request', () => {
    it('should response 200 status update status favorite of contact', async () => {
      const contact = await Contact.create({
        ...newContact,
        owner: user._id,
      });

      const res = await request(app)
        .patch(`/api/contacts/${contact._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ favorite: true });

      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
      expect(res.body.data.contact.favorite).toBe(true);
    });

    it('should response 400 status update status favorite of contact', async () => {
      const res = await request(app)
        .patch(`/api/contacts/123/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ favorite: true });

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });
  });

  describe('should handle delete request', () => {
    it('should response 200 status delete contact', async () => {
      const contact = await Contact.create({
        ...newContact,
        owner: user._id,
      });

      const res = await request(app)
        .delete(`/api/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
    });

    it('should response 400 status for delete contact with wrong id', async () => {
      const res = await request(app)
        .delete(`/api/contacts/123`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(res.status).toEqual(HttpCode.BAD_REQUEST);
      expect(res.body).toBeDefined();
    });
  });
});
