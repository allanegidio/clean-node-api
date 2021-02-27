import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

interface LogControllerDecoratorTypes {
  logControllerDecorator: LogControllerDecorator
  controllerStub: Controller
}

const controllerFactory = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: {
          name: 'test_log',
          email: 'test_log@mail.com',
          password: '123',
          passwordConfirmation: '123'
        }
      }
      return await new Promise(resolve => resolve(httpResponse))
    }
  }

  return new ControllerStub()
}

const logControllerDecoratorFactory = (): LogControllerDecoratorTypes => {
  const controllerStub = controllerFactory()
  const logControllerDecorator = new LogControllerDecorator(controllerStub)

  return {
    controllerStub, logControllerDecorator
  }
}

describe('LogController Decorator', () => {
  test('Should call controller handle method', async () => {
    const { controllerStub, logControllerDecorator } = logControllerDecoratorFactory()
    const handleSpy = jest.spyOn(controllerStub, 'handle')
    const httpRequest = {
      body: {
        name: 'test_log',
        email: 'test_log@mail.com',
        password: '123',
        passwordConfirmation: '123'
      }
    }

    await logControllerDecorator.handle(httpRequest)

    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should return the same result of the controller handle method', async () => {
    const { logControllerDecorator } = logControllerDecoratorFactory()
    const httpRequest = {
      body: {
        name: 'test_log',
        email: 'test_log@mail.com',
        password: '123',
        passwordConfirmation: '123'
      }
    }

    const httpResponse = await logControllerDecorator.handle(httpRequest)

    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: 'test_log',
        email: 'test_log@mail.com',
        password: '123',
        passwordConfirmation: '123'
      }
    })
  })
})
