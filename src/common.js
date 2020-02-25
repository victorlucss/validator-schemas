class ValidationError extends Error {
    constructor(message, code = 409) {
        super()
        Error.captureStackTrace(this, ValidationError)
        this.message = message
        this.code = code
    }
}
  module.exports.ValidationError = ValidationError;