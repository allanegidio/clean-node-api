import { Encrypter, AddAccountModel, AccountModel, AddAccountRepository } from '../add-acount/db-add-account-protocols'
import { DbAddAccount } from './db-add-acount'

interface DbAddAccountTypes {
  dbAddAccount: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

const fakeAccountFactory = (): AccountModel => ({
  id: 'valid_Id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'hashed_password'
})

const fakeAccountDataFactory = (): AddAccountModel => ({
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const encrypterStubFactory = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}

const addAccountRepositoryStubFactory = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve(fakeAccountFactory()))
    }
  }

  return new AddAccountRepositoryStub()
}

const dbAddAccountFactory = (): DbAddAccountTypes => {
  const encrypterStub = encrypterStubFactory()
  const addAccountRepositoryStub = addAccountRepositoryStubFactory()
  const dbAddAccount = new DbAddAccount(encrypterStub, addAccountRepositoryStub)

  return {
    encrypterStub,
    addAccountRepositoryStub,
    dbAddAccount
  }
}

describe('DbAddAcount UseCase', () => {
  test('Should call Ecrypter with correct password', async () => {
    // Arrange
    const { dbAddAccount, encrypterStub } = dbAddAccountFactory()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    // Act
    await dbAddAccount.add(fakeAccountDataFactory())

    // Asserts
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Ecrypter throws', async () => {
    // Arrange
    const { dbAddAccount, encrypterStub } = dbAddAccountFactory()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    // Act
    const promise = dbAddAccount.add(fakeAccountDataFactory())

    // Asserts
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAcountRepository with correct data', async () => {
    // Arrange

    const { dbAddAccount, addAccountRepositoryStub } = dbAddAccountFactory()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    // Act
    await dbAddAccount.add(fakeAccountDataFactory())

    // Asserts
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if AddAccountRepository throws', async () => {
    // Arrange
    const { dbAddAccount, addAccountRepositoryStub } = dbAddAccountFactory()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    // Act
    const promise = dbAddAccount.add(fakeAccountDataFactory())

    // Asserts
    await expect(promise).rejects.toThrow()
  })

  test('Should return ad account on success', async () => {
    // Arrange
    const { dbAddAccount } = dbAddAccountFactory()

    // Act
    const account = await dbAddAccount.add(fakeAccountDataFactory())

    // Asserts
    expect(account).toEqual(fakeAccountFactory())
  })
})
