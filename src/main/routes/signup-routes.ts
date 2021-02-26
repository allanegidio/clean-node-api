import { Router } from 'express'
import { expressAdaptRoute } from '../adapters/express-route-adapter'
import { signUpControllerFactory } from '../factories/signup'

export default (router: Router): void => {
  router.post('/signup', expressAdaptRoute(signUpControllerFactory()))
}
