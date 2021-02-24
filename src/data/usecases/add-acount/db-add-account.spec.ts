import { Encrypter } from '../add-acount/db-add-account-protocols'
import { DbAddAccount } from './db-add-acount'

interface DbAddAccountTypes {
  dbAddAccount: DbAddAccount
  encrypterStub: Encrypter
}

const encrypterStubFactory = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}

const dbAddAccountFactory = (): DbAddAccountTypes => {
  const encrypterStub = encrypterStubFactory()
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

  test('Should throw if Ecrypter throws', async () => {
    // Arrange
    const { dbAddAccount, encrypterStub } = dbAddAccountFactory()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    // Act
    const promise = dbAddAccount.add(accountData)

    // Asserts
    await expect(promise).rejects.toThrow()
  })
})
