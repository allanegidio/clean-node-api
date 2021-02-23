import { Encrypter } from '../../protocols/encrypter'
import { DbAddAccount } from './db-add-acount'

describe('DbAddAcount UseCase', () => {
  test('Should call Ecrypter with correct password', async () => {
    // Arrange
    class EncrypterStub implements Encrypter {
      async encrypt (value: string): Promise<string> {
        return await new Promise(resolve => resolve('hashed_password'))
      }
    }

    const encrypterStub = new EncrypterStub()
    const dbAccount = new DbAddAccount(encrypterStub)
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    // Act
    await dbAccount.add(accountData)

    // Asserts
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })
})
