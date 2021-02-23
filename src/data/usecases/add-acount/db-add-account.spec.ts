import { Encrypter } from '../../protocols/encrypter'
import { DbAddAccount } from './db-add-acount'

interface DbAddAccountTypes {
  dbAddAccount: DbAddAccount
  encrypterStub: Encrypter
}

const dbAddAccountFactory = (): DbAddAccountTypes => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  const encrypterStub = new EncrypterStub()
  const dbAddAccount = new DbAddAccount(encrypterStub)

  return {
    encrypterStub,
    dbAddAccount
  }
}

describe('DbAddAcount UseCase', () => {
  test('Should call Ecrypter with correct password', async () => {
    // Arrange

    const { dbAddAccount, encrypterStub } = dbAddAccountFactory()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    // Act
    await dbAddAccount.add(accountData)

    // Asserts
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })
})
