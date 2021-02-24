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
    const bcryptAdapter = bcryptAdapterFactory()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    // Act
    await bcryptAdapter.encrypt('any_value')

    // Assert
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should return a hash on success', async () => {
    // Arrange
    const bcryptAdapter = bcryptAdapterFactory()

    // Act
    const hash = await bcryptAdapter.encrypt('any_value')

    // Assert
    expect(hash).toBe('hash')
  })

  test('Should throw if bcrypt throws', async () => {
    // Arrange
    const bcryptAdapter = bcryptAdapterFactory()
    jest.spyOn(bcrypt, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    // Act
    const promise = bcryptAdapter.encrypt('any_value')

    // Assert
    await expect(promise).rejects.toThrow()
  })
})
