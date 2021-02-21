import { ServerError } from '../errors/server-error'
import { HttpResponse } from '../protocols'

export const badRequest = (error: Error): HttpResponse => {
  return {
    statusCode: 400,
    body: error
  }
}

export const serverError = (): HttpResponse => {
  return {
    statusCode: 500,
    body: new ServerError()
  }
}

// This is a syntact sugar to avoid return keyword like above
export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})
