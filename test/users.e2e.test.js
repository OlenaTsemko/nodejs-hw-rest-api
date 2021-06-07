const fs = require('fs/promises');
const request = require('supertest');
const { newTestUser } = require('./data/data');
const app = require('../app');
const db = require('../model/db');
const User = require('../schemas/user');
const { HttpCode } = require('../helpers/constants');

jest.mock('cloudinary');

describe('E2E test the routes api/users', () => {
  let token;

  beforeAll(async () => {
    await db;
    await User.deleteOne({ email: newTestUser.email });
  });

  afterAll(async () => {
    const mongo = await db;
    await User.deleteOne({ email: newTestUser.email });
    await mongo.disconnect();
  });

  it('should response 201 status signup user', async () => {
    const res = await request(app).post('/api/users/signup').send(newTestUser);

    expect(res.status).toEqual(HttpCode.CREATED);
    expect(res.body).toBeDefined();
  });

  it('should response 409 status signup user', async () => {
    const res = await request(app).post('/api/users/signup').send(newTestUser);

    expect(res.status).toEqual(HttpCode.CONFLICT);
    expect(res.body).toBeDefined();
  });

  it('should response 200 status login user', async () => {
    const res = await request(app).post('/api/users/login').send(newTestUser);

    expect(res.status).toEqual(HttpCode.OK);
    expect(res.body).toBeDefined();
    token = res.body.data.token;
  });

  it('should response 401 status login user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'fake@fake.com', password: 'fake' });

    expect(res.status).toEqual(HttpCode.UNAUTHORIZED);
    expect(res.body).toBeDefined();
  });

  it('should response 200 status upload avatar user', async () => {
    const buf = await fs.readFile('./test/data/cat2.jpg');

    const res = await request(app)
      .patch('/api/users/avatars')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', buf, 'cat2.jpg');

    expect(res.status).toEqual(HttpCode.OK);
    expect(res.body).toBeDefined();
    expect(res.body.data.avatarUrl).toBe('secureUrl');
  });

  it('should response 401 status upload avatar user with invalid token', async () => {
    const buf = await fs.readFile('./test/data/cat2.jpg');

    const res = await request(app)
      .patch('/api/users/avatars')
      .set('Authorization', `Bearer 123`)
      .attach('avatar', buf, 'cat2.jpg');

    expect(res.status).toEqual(HttpCode.UNAUTHORIZED);
    expect(res.body).toBeDefined();
  });
});
