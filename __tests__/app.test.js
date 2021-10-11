require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    let createdTodo = null;

    test('POST /api/todos adds a todo', async () => {
      const newTodo = {
        todo: 'JUST DO IT'
      };

      const expectation = {
        todo: 'JUST DO IT',
        user_id: expect.any(Number),
        completed: false,
        id: expect.any(Number)
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      //store the response for later tests
      createdTodo = data.body;
      expect(data.body).toEqual(expectation);
    });

    test('GET /api/todos returns todos', async () => {

      const expectation = [
        {
          todo: 'JUST DO IT',
          user_id: expect.any(Number),
          completed: false,
          id: expect.any(Number)
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('PUT /api/todos updates a todo', async () => {
      const updatedTodo = {
        todo: 'idk',
        completed: true,
        todo_id: createdTodo.id,
        user_id: createdTodo.user_id
      };

      const expectation = {
        todo: 'idk',
        completed: true,
        id: createdTodo.id,
        user_id: createdTodo.user_id
      };

      const data = await fakeRequest(app)
        .put('/api/todos')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
