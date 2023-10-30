import mongoose from "mongoose";
import supertest from "supertest"
import app from "../app.js"
import User from "../models/user.js"
import { cleanUpDatabase, generateValidJwt } from "./utils.js"

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe('POST /users', function() {
  it('should create a user', async function() {
    const res = await supertest(app)
      .post('/users')
      .send({
        name: 'John Doe',
        password: '1234'
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeObject();
    expect(res.body._id).toBeString();
    expect(res.body.name).toEqual('John Doe');
    expect(res.body).toContainAllKeys(['_id', 'name'])
  });
});

describe('GET /users', function() {
  let johnDoe;
  let janeDoe;
  beforeEach(async function() {
    // Create 2 users before retrieving the list.
    [ johnDoe, janeDoe ] = await Promise.all([
      User.create({ name: 'John Doe' }),
      User.create({ name: 'Jane Doe' })
    ]);
  });

  test('should retrieve the list of users', async function() {
    const token = await generateValidJwt(johnDoe);
    const res = await supertest(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeArray();
    expect(res.body).toHaveLength(2);

    expect(res.body[0]).toBeObject();
    expect(res.body[0]._id).toEqual(janeDoe.id);
    expect(res.body[0].name).toEqual('Jane Doe');
    expect(res.body[0]).toContainAllKeys(['_id', 'name']);

    expect(res.body[1]).toBeObject();
    expect(res.body[1]._id).toEqual(johnDoe.id);
    expect(res.body[1].name).toEqual('John Doe');
    expect(res.body[1]).toContainAllKeys(['_id', 'name']);
  });
});