import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account'

describe('Account MongoDb Repository', () => {
  beforeAll(async () => {
    // await MongoHelper.connect(process.env.MONGO_URL as string)
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  const accountMongoRepositoryFactory = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }

  test('Should return an account on success', async () => {
    // Arrange
    const accountMongoRepository = accountMongoRepositoryFactory()

    // Act
    const account = await accountMongoRepository.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })

    // Asserts
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('any_name')
    expect(account.email).toBe('any_email@mail.com')
    expect(account.password).toBe('any_password')
  })
})
