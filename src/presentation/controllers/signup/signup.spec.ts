import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { SignUpController } from './signup'
import { EmailValidator, AddAccount, AddAccountModel, AccountModel } from './signup-protocols'

interface SignUpTypes {
  controller: SignUpController
  emailValidatorStub: EmailValidator
  addAcountStub: AddAccount
}

const emailValidatorStubFactory = (): EmailValidator => {
  /**
   * Stubs are used to force a function return a forced condition
   */
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const addAcountStubFactory = (): AddAccount => {
  class AddAcountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }

      return await new Promise(resolve => resolve(fakeAccount))
    }
  }

  return new AddAcountStub()
}

const signupControllerFactory = (): SignUpTypes => {
  const emailValidatorStub = emailValidatorStubFactory()
  const addAcountStub = addAcountStubFactory()
  const controller = new SignUpController(emailValidatorStub, addAcountStub)

  return {
    controller,
    emailValidatorStub,
    addAcountStub
  }
}

describe('Singup Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('Should return 400 if no email is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 if no password confirmation is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return 400 if password confirmation fails', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should return 400 if an invalid email is provided', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should call EmailValidator with correct email', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    const isValid = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    await controller.handle(httpRequest)

    // Assert
    expect(isValid).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return 500 if EmailValidator throws', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => { throw new Error() })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AddAcount with correct values', async () => {
    // Arrange
    const { controller, addAcountStub } = signupControllerFactory()
    const addSpy = jest.spyOn(addAcountStub, 'add')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    await controller.handle(httpRequest)

    // Assert
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'valid_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 500 if AddAcount throws', async () => {
    // Arrange
    const { controller, addAcountStub } = signupControllerFactory()
    jest.spyOn(addAcountStub, 'add').mockImplementation(async () => {
      return await new Promise((resolve, reject) => { reject(new Error()) })
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 200 if valid data is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    })
  })
})
