import { LogErrorRepository } from '../../data/db/log-error-repository'
import { AccountModel } from '../../domain/models/account'
import { ok, serverError } from '../../presentation/helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

interface LogControllerDecoratorTypes {
  logControllerDecorator: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStub: LogErrorRepository
}

const logErrorRepositoryFactory = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async logError (stack: string): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }

  return new LogErrorRepositoryStub()
}

const controllerFactory = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      return await new Promise(resolve => resolve(ok(fakeAccountFactory())))
    }
  }

  return new ControllerStub()
}

const logControllerDecoratorFactory = (): LogControllerDecoratorTypes => {
  const controllerStub = controllerFactory()
  const logErrorRepositoryStub = logErrorRepositoryFactory()
  const logControllerDecorator = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)

  return {
    controllerStub, logControllerDecorator, logErrorRepositoryStub
  }
}

const fakeHttpRequestFactory = (): HttpRequest => ({
  body: {
    name: 'test_log',
    email: 'test_log@mail.com',
    password: '123',
    passwordConfirmation: '123'
  }
})

const fakeErrorFactory = (): HttpResponse => {
  const errorStub = new Error()
  errorStub.stack = 'any_stack'
  return serverError(errorStub)
}

const fakeAccountFactory = (): AccountModel => ({
  id: 'valid_id',
  name: 'test_log@mail.com',
  email: 'valid_email@mail.com',
  password: '123'
})

describe('LogController Decorator', () => {
  test('Should call controller handle method', async () => {
    // Arrange
    const { controllerStub, logControllerDecorator } = logControllerDecoratorFactory()
    const handleSpy = jest.spyOn(controllerStub, 'handle')

    // Act
    await logControllerDecorator.handle(fakeHttpRequestFactory())

    // Assert
    expect(handleSpy).toHaveBeenCalledWith(fakeHttpRequestFactory())
  })

  test('Should return the same result of the controller handle method', async () => {
    // Arrange
    const { logControllerDecorator } = logControllerDecoratorFactory()

    // Act
    const httpResponse = await logControllerDecorator.handle(fakeHttpRequestFactory())

    // Assert
    expect(httpResponse).toEqual(ok(fakeAccountFactory()))
  })

  test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
    // Arrange
    const { logControllerDecorator, controllerStub, logErrorRepositoryStub } = logControllerDecoratorFactory()
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError')
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(fakeErrorFactory())))

    // Act
    await logControllerDecorator.handle(fakeHttpRequestFactory())

    // Assert
    expect(logSpy).toHaveBeenCalledWith('any_stack')
  })
})
