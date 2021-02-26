import { Express, Router } from 'express'
import fg from 'fast-glob'

export default (app: Express): void => {
  const router = Router()
  app.use('/api', router)
  fg.sync('**/src/main/routes/**routes.ts').map(async file => {
    // Here I get every file in routes folder and send Express Router as a parameter.
    const route = (await import(`../../../${file}`)).default
    route(router)
  })
}
