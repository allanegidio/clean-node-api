import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

describe('LogController Decorator', () => {
  test('Should call controller handle method', async () => {
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

    const controllerStub = new ControllerStub()
    const handleSpy = jest.spyOn(controllerStub, 'handle')
    const logControllerDecorator = new LogControllerDecorator(controllerStub)
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
})
