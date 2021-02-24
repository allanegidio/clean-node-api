import bcrypt from 'bcrypt'
import { BCrypterAdapter } from './bcrypt-adapter'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => resolve('hash'))
  }
}))

describe('Bcrypt Adapter', () => {
  test('Should call bcrypt with correct value', async () => {
    // Arrange
    const salt = 12
    const bcryptAdapter = new BCrypterAdapter(salt)
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    // Act
    await bcryptAdapter.encrypt('any_value')

    // Assert
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should return a hash on success', async () => {
    // Arrange
    const salt = 12
    const bcryptAdapter = new BCrypterAdapter(salt)

    // Act
    const hash = await bcryptAdapter.encrypt('any_value')

    // Assert
    expect(hash).toBe('hash')
  })
})
