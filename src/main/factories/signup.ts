import { DbAddAccount } from '../../data/usecases/add-acount/db-add-acount'
import { BCrypterAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'

export const signUpControllerFactory = (): SignUpController => {
  const salt = 12
  const emailValidatorAdapter = new EmailValidatorAdapter()
  const bcrypterAdapter = new BCrypterAdapter(salt)
  const accountMongoRepository = new AccountMongoRepository()
  const addAccount = new DbAddAccount(bcrypterAdapter, accountMongoRepository)

  return new SignUpController(emailValidatorAdapter, addAccount)
}
