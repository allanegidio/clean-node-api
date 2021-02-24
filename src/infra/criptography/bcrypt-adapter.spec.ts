import bcrypt from 'bcrypt'
import { BCrypterAdapter } from './bcrypt-adapter'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => resolve('hash'))
  }
}))

const salt = 12
const bcryptAdapterFactory = (): BCrypterAdapter => {
  return new BCrypterAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  test('Should call bcrypt with correct value', async () => {
    // Arrange
    const bcryptAdapterStub = bcryptAdapterFactory()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    // Act
    await bcryptAdapterStub.encrypt('any_value')

    // Assert
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should return a hash on success', async () => {
    // Arrange
    const bcryptAdapterStub = bcryptAdapterFactory()

    // Act
    const hash = await bcryptAdapterStub.encrypt('any_value')

    // Assert
    expect(hash).toBe('hash')
  })
})
