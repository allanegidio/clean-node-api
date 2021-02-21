import { AccountModel } from '../../domain/models/account'
import { AddAccount, AddAccountModel } from '../../domain/usercases/add-acount'
import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'
import { SignUpController } from './signup'

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
    add (account: AddAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }

      return fakeAccount
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
  test('Should return 400 if no name is provided', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('Should return 400 if no email is provided', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 if no password confirmation is provided', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return 400 if password confirmation fails', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should return 400 if an invalid email is provided', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should call EmailValidator with correct email', () => {
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
    controller.handle(httpRequest)

    // Assert
    expect(isValid).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return 500 if EmailValidator throws', () => {
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
    const httpResponse = controller.handle(httpRequest)

    // Assert
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AddAcount with correct values', () => {
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
    controller.handle(httpRequest)

    // Assert
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'valid_email@mail.com',
      password: 'any_password'
    })
  })
})
