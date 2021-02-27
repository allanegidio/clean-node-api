import { ServerError } from '../errors'
import { HttpResponse } from '../protocols'

export const badRequest = (error: Error): HttpResponse => {
  return {
    statusCode: 400,
    body: error
  }
}

export const serverError = (error: Error): HttpResponse => {
  return {
    statusCode: 500,
    body: new ServerError(error.stack as string)
  }
}

// This is a syntact sugar to avoid return keyword like above
export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})
