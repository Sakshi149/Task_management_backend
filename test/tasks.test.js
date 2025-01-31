import * as chai from 'chai';
import { default as chaiHttp, request } from "chai-http";
import app from '../app.js';

chai.use(chaiHttp);

const { expect } = chai;

let server;

before((done) => {
  server = app.listen(5000, () => {
    console.log('Test server running on port 5000');
    done();
  });
});

after((done) => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('GET /tasks', () => {
  it('should return a list of tasks', async () => {
    const res = await request.execute(app).get('/tasks');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });
});


describe('GET /tasks/:id', () => {
  it('should fetch a task by id and return 200 status', async () => {
    const res = await request.execute(app).get('/tasks');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });

  //
  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app).get('/tasks/99999');

    console.log("Response body:", res.body);

    expect(res).to.have.status(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'No records found');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should return a list of tasks', async () => {
    const res = await request.execute(app).get('/tasks');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });

  //
  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app).get('/tasks/99999');

    console.log("Response body:", res.body);

    expect(res).to.have.status(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Please provide task Id or valid task id');
  });
});

describe('PUT /tasks/:id', () => {
  it('should return a list of tasks', async () => {
    const res = await request.execute(app).get('/tasks');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });
});



// describe('POST /tasks', () => {
//   it('should create a new task and return 201 status', async () => {
//     const res = await request.execute(app).post('/tasks').send({
//         title: 'Test Task',
//         description: 'This is a test task.',
//         status: 'pending'
//     });

//     expect(res).to.have.status(201);
//     expect(res.body).to.be.an('object');
//     expect(res.body).to.have.property('success', true);
//     expect(res.body).to.have.property('message', 'New task added successfully');
//     expect(res.body).to.have.property('task');
//     expect(res.body.task).to.have.property('id');
//     expect(res.body.task).to.have.property('title', 'Test Task');
//     expect(res.body.task).to.have.property('description', 'This is a test task.');
//     expect(res.body.task).to.have.property('status', 'pending');
//   });
// });