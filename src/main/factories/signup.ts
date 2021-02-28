import { DbAddAccount } from '../../data/usecases/add-acount/db-add-acount'
import { BCrypterAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { LogMongoRepository } from '../../infra/db/mongodb/log-repository/log'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { Controller } from '../../presentation/protocols'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'
import { LogControllerDecorator } from '../decorators/log'

export const signUpControllerFactory = (): Controller => {
  const salt = 12
  const emailValidatorAdapter = new EmailValidatorAdapter()
  const bcrypterAdapter = new BCrypterAdapter(salt)
  const accountMongoRepository = new AccountMongoRepository()
  const addAccount = new DbAddAccount(bcrypterAdapter, accountMongoRepository)
  const logMongoRepository = new LogMongoRepository()
  const signUpController = new SignUpController(emailValidatorAdapter, addAccount)
  return new LogControllerDecorator(signUpController, logMongoRepository)
}
