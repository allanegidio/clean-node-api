import { SignUpController } from './signup'

describe('Singup Controller', () => {
  test('Should return 400 if no name is provided', () => {
    // Arrange
    const signupController = new SignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = signupController.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
  })
})
