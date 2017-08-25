const ERRORS = {
  ParseErrors: [],
  TokenSyntaxErrors: []
}
export class ParseError {
  constructor(message, c) {
    this.message = `${message} (char ${c})`
    ERRORS.ParseErrors.push(this)
  }

  static all = () => {
    return ERRORS.ParseErrors
  }
}

export class TokenSyntaxError {
  constructor(message, c) {
    this.message = `${message} (char ${c})`
    ERRORS.TokenSyntaxErrors.push(this)
  }

  static all = () => {
    return ERRORS.TokenSyntaxErrors
  }
}
