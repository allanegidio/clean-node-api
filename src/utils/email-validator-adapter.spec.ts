import validator from 'validator'
import { EmailValidatorAdapter } from './email-validator-adapter'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

describe('EmailValidator Adapter', () => {
  test('Should return false if validator returns false', () => {
    // Arrange
    const emailValidatorAdapter = new EmailValidatorAdapter()
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)

    // Act
    const isValid = emailValidatorAdapter.isValid('invalid_email')

    // Assert
    expect(isValid).toBeFalsy()
  })

  test('Should return true if validator returns true', () => {
    // Arrange
    const emailValidatorAdapter = new EmailValidatorAdapter()

    // Act
    const isValid = emailValidatorAdapter.isValid('valid_email@email.com')

    // Assert
    expect(isValid).toBeTruthy()
  })

  test('Should call validator with correct email', () => {
    // Arrange
    const emailValidatorAdapter = new EmailValidatorAdapter()
    const isEmailSpy = jest.spyOn(validator, 'isEmail')

    // Act
    emailValidatorAdapter.isValid('any_email@mail.com')

    // Assert
    expect(isEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
