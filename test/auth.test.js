import * as chai from 'chai';
import { default as chaiHttp, request } from "chai-http";
import app from '../app.js';

const { expect } = chai;
chai.use(chaiHttp);

let token = null;

describe('User Authentication Tests', () => {
  it('Should register a new user', async () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const res = await request.execute(app)
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test@1234'
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('message').equal('User registered successfully.');
    // expect(res.body).to.have.property('userId');
  });

  it('Should log in the user and return a token', async () => {
    const res = await request.execute(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'Test@1234'
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
    token = res.body.token; 
  });

  it('Should return 401 Unauthorized when no token is provided', async () => {
    const res = await request.execute(app)
      .get('/api/v1/tasks');  // Corrected the route based on REST conventions

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('error').that.is.a('string');
  });
});
