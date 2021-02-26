import request from 'supertest'
import app from '../config/app'

describe('SignUp Routes', () => {
  test('Should return an account on success', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'integration_test',
        email: 'integration_test@mail.com',
        password: 'integration_test',
        passwordConfirmation: 'integration_test'
      })
      .expect(200)
  })
})
