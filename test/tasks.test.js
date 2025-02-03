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

let task_id = null;

describe('POST /api/v1/tasks', () => {
  it('should create a new task and return 200 status', async () => {
    const res = await request.execute(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending'
      });

      task_id = res.task_id;
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success');
    expect(res.body).to.have.property('message');
  });

  it('should return 400 if all fields are not present', async () => {
    const res = await request.execute(app)
      .post('/api/v1/tasks')
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
    const res = await request.execute(app).get('/api/v1/tasks');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('tasks').that.is.an('array');
  });
});


describe('GET /api/v1/tasks/:id', () => {
  it('should fetch a task by id and return 200 status', async () => {
    // console.log('Endpoint=', `/api/v1/tasks/${task_id}`);
    // const res = await request.execute(app).get(`/api/v1/tasks/${task_id}`);
    const res = await request.execute(app).get(`/api/v1/tasks/68`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('taskDetails').that.is.an('object'); 
  });

  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app).get('/api/v1/tasks/99999')

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
  });
})

describe('PUT /tasks/:id', () => {
  it('should update a list of tasks', async () => {
    const res = await request.execute(app)
    // .put(`/api/v1/tasks/${task_id}`)
    .put(`/api/v1/tasks/68`)
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
    const res = await request.execute(app).put('/api/v1/tasks/999').send({
        title: 'Updated Task',
        description: 'Updated description',
        status: 'completed'
    });

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
});
});

describe('DELETE /tasks/:id', () => {
  it('should delete a task successfully', async () => {
    // const res = await request.execute(app).delete(`/api/v1/tasks/${task_id}`);
    const res = await request.execute(app).delete(`/api/v1/tasks/68`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('message', 'Task deleted successfully');
  });

  it('should return 404 if the task does not exist', async () => {
    const res = await request.execute(app).delete('/api/v1/tasks/999');

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
    expect(res.body).to.have.property('message', 'Task not found');
  });
});


