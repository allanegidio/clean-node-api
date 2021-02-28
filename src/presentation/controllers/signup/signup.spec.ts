import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { SignUpController } from './signup'
import { EmailValidator, AddAccount, AddAccountModel, AccountModel } from './signup-protocols'

interface SignUpTypes {
  controller: SignUpController
  emailValidatorStub: EmailValidator
  addAcountStub: AddAccount
}

const fakeRequestFactory = (): HttpRequest => ({
  body: {
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_password',
    passwordConfirmation: 'valid_password'
  }
})

const fakeAccountFactory = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

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
      return await new Promise(resolve => resolve(fakeAccountFactory()))
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
    const httpRequest = fakeRequestFactory()
    delete httpRequest.body.name

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new MissingParamError('name')))
  })

  test('Should return 400 if no email is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = fakeRequestFactory()
    delete httpRequest.body.email

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
  })

  test('Should return 400 if no password is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = fakeRequestFactory()
    delete httpRequest.body.password

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  test('Should return 400 if no password confirmation is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = fakeRequestFactory()
    delete httpRequest.body.passwordConfirmation

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new MissingParamError('passwordConfirmation')))
  })

  test('Should return 400 if password confirmation fails', async () => {
    // Arrange
    const { controller } = signupControllerFactory()
    const httpRequest = fakeRequestFactory()
    httpRequest.body.passwordConfirmation = 'password_different'

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('passwordConfirmation')))
  })

  test('Should return 400 if an invalid email is provided', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = fakeRequestFactory()
    httpRequest.body.email = 'invalid_email'

    // Action
    const httpResponse = await controller.handle(httpRequest)

    // Assert
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('Should call EmailValidator with correct email', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    const isValid = jest.spyOn(emailValidatorStub, 'isValid')

    // Action
    await controller.handle(fakeRequestFactory())

    // Assert
    expect(isValid).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return 500 if EmailValidator throws', async () => {
    // Arrange
    const { controller, emailValidatorStub } = signupControllerFactory()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => { throw new Error() })

    // Action
    const httpResponse = await controller.handle(fakeRequestFactory())

    // Assert
    expect(httpResponse).toEqual(serverError(new ServerError(new Error().stack as string)))
  })

  test('Should call AddAcount with correct values', async () => {
    // Arrange
    const { controller, addAcountStub } = signupControllerFactory()
    const addSpy = jest.spyOn(addAcountStub, 'add')

    // Action
    await controller.handle(fakeRequestFactory())

    // Assert
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    })
  })

  test('Should return 500 if AddAcount throws', async () => {
    // Arrange
    const { controller, addAcountStub } = signupControllerFactory()
    jest.spyOn(addAcountStub, 'add').mockImplementation(async () => {
      return await new Promise((resolve, reject) => { reject(new Error()) })
    })

    // Action
    const httpResponse = await controller.handle(fakeRequestFactory())

    // Assert
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse).toEqual(serverError(new ServerError(new Error().stack as string)))
  })

  test('Should return 200 if valid data is provided', async () => {
    // Arrange
    const { controller } = signupControllerFactory()

    // Action
    const httpResponse = await controller.handle(fakeRequestFactory())

    // Assert
    expect(httpResponse).toEqual(ok(fakeAccountFactory()))
  })
})
