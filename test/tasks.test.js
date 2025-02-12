import * as chai from 'chai';
import { default as chaiHttp, request } from "chai-http";
import app from '../app.js';

chai.use(chaiHttp);

const { expect } = chai;

let server;
let token = null;
let task_id = null; 

before(async () => {
  server = app.listen(5000, () => {
    console.log('Test server running on port 5000');
  });

  const res = await request.execute(app)
    .post('/auth/login')
    .send({
      email: 'testuser@example.com',
      password: 'Test@1234'
    });

  console.log("Login Response Body:", res.body);

  token = res.body.token;
});

after((done) => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('POST /api/v1/tasks', () => {
  it('should create a new task and return 200 status', async () => {
    const res = await request.execute(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending'
      });

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success');
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('task_id');

    task_id = res.body.task_id; 
  });

  it('should return 400 if all fields are not present', async () => {
    const res = await request.execute(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
      });

    expect(res).to.have.status(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Please provide all fields: title, description, and status');
  });
});

describe('GET /api/v1/tasks', () => {
  it('should return a list of tasks', async () => {
    const res = await request.execute(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });
});

describe('GET /api/v1/tasks/:id', () => {
  it('should fetch a task by id and return 200 status', async () => {
    const res = await request.execute(app)
      .get(`/api/v1/tasks/${task_id}`) 
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('taskDetails').that.is.an('object');
  });

  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app)
      .get('/api/v1/tasks/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
  });
});

describe('PUT /api/v1/tasks/:id', () => {
  it('should update the task successfully', async () => {
    const res = await request.execute(app)
      .put(`/api/v1/tasks/${task_id}`) 
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'completed'
      })
      .set('Content-Type', 'application/json');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('message', 'Task details updated');
  });

  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app)
      .put('/api/v1/tasks/999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        status: 'completed'
      });

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
  });
});

describe('DELETE /api/v1/tasks/:id', () => {
  it('should delete the task successfully', async () => {
    const res = await request.execute(app)
      .delete(`/api/v1/tasks/${task_id}`) 
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('message', 'Task deleted successfully');
  });

  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app)
      .delete('/api/v1/tasks/999')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
  });
});

