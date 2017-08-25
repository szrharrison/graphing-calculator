import Token from './Token'
import Validator from './Validator'
import { DELIMETERS, NAMED_DELIMITERS } from '../../constants'
import { ParseError, TokenSyntaxError } from '../Errors'

function Expression() {
  this.i = 0                    // current index in expr
  this.c = ''                   // current token character in expr
  this.expression = ''          // current expression
  this.nesting_level = 0        // when a conditional is being parsed, the level of the conditional is stored here
  this.conditional_level = null // when a conditional is being parsed, the level of the conditional is stored here
  this.token = new Token()      // current token
  this.comment = ''             // current comment
  this.errors = []

  /**
   * Get the next character from the expression.
   * The character is stored into the char c. If the end of the expression is
   * reached, the function puts an empty string in c.
   * @public
   */
  this.next = () => {
    this.i ++
    this.c = this.expression.charAt(i)
  }

  /**
   * Preview the previous character from the expression.
   * @return {string}
   * @private
   */
  const previous = () => {
    return this.expression.charAt(this.i - 1)
  }

  /**
   * Preview the next character from the expression.
   * @return {string}
   * @private
   */
  const previewNext = () => {
    return this.expression.charAt(this.i + 1)
  }

  /**
   * Preview the next two characters from the expression.
   * @return {string}
   * @private
   */
  const previewMore = () => {
    return (
      this.expression.charAt(this.i + 1) + this.expression.charAt(this.i + 2)
    )
  }

  /**
   * Get next token in the current string expr.
   * The token and token type are available as token and token_type
   * @public
   */
  this.nextToken = () => {
    const c = this.c
    this.token = new Token()
    const token = this.token
    this.comment = ''
    const isEnd = (c === '')

    nextWhitespace()
    if(c === '@') {
      nextComment()
    }

    if(isEnd) {
      token.type = TOKENTYPE.DELIMETER
      return
    }

    if(c === '\n' && !this.nesting_level) {
      token.type = TOKENTYPE.DELIMETER
      token.string = c
      next()
      return
    }

    let c2 = c + previewNext()
    let c3 = c + previewMore()

    if(c3.length === 3 && DELIMITERS.hasOwnProperty(c3)) {
      nextDelimeter(3)
      return
    }
    if(c2.length === 2 && DELIMITERS.hasOwnProperty(c2)) {
      nextDelimeter(2)
      return
    }
    if(DELIMITERS.hasOwnProperty(c)) {
      nextDelimeter()
      return
    }
    if(Validator.isDigitDot(c)) {
      nextNumber()
      return
    }
    if(Validator.isAlphic(c, previous(), previewNext())) {
      nextAlphic()
      return
    }

    token.type = TOKENTYPE.UNKNOWN
    while(c !== '') {
      token.string += c
      next()
    }
    this.errors.push( new ParseError(`Syntax error in part: "${token.string}"`))
  }

  /**
   * Get next token and skip newline tokens
   * @public
   */
  this.nextTokenSkipNewline = () => {
    do {
      this.nextToken()
    } while(this.token.string === '\n')
  }

  /**
   * Start parameters.
   * New line characters will be ignored until paramsEnd() is called
   * @public
   */
  this.paramsStart = () => {
    this.nesting_level ++
  }

  /**
   * End parameters.
   * New line characters will no longer be ignored
   * @public
   */
  this.paramsEnd = () => {
    this.nesting_level --
  }

  /**
   * Set the information needed for Alphic tokens
   * Called in nextToken()
   * @private
   */
  const nextAlphic = () => {
    const {c, token} = this
    while(
      Validator.isAlphic(
        c,
        previous(),
        previewNext()
      ) ||
      Validator.isDigit(
        c
      )
    ) {
      token.string += c
      next()
    }

    if(NAMED_DELIMITERS.hasOwnProperty(token.string)) {
      token.type = TOKENTYPE.DELIMETER
    } else {
      token.type = TOKENTYPE.SYMBOL
    }
  }

  /**
   * Set the information needed for Delimeter tokens
   * based on the length of the delimeter.
   * Called in nextToken()
   * @param {integer} n
   * @private
   */
  const nextDelimeter = n => {
    const {c, token} = this
    token.type = TOKENTYPE.DELIMETER
    switch (n) {
      case 3:
        token.string = c + previewMore()
        next()
        next()
        next()
        break
      case 2:
        token.string = c + previewNext()
        next()
        next()
        break
      default:
        token.string = c
        next()
    }
  }

  /**
   * Set the information needed for Number tokens
   * Called in nextToken()
   * @private
   */
  const nextNumber = () => {
    const {c, token} = this
    token.type = TOKENTYPE.NUMBER

    if(c === '.') {
      token.string += c
      next()

      if(!Validator.isDigit(c)) {
        token.type = TOKENTYPE.DELIMETER
      }
    } else {
      while(Validator.isDigit(c)) {
        token.string += c
        next()
      }
      if(Validator.isDecimalMark(c, previewNext())) {
        token.string += c
        next()
      }
    }

    const c2 = previewNext()

    if(c === 'E' || c === 'e') {
      if(Validator.isDigit(c2) || c2 === '-' || c2 === '+') {
        token.string += c
        next()

        if(c === '-' || c === '+') {
          token.string += c
          next()
        }

        if(!Validator.isDigit(c)) {
          this.errors.push(new TokenSyntaxError(`Digit expected, got "${c}"`))
        }

        while(Validator.isDigit(c)) {
          token.string += c
          next()
        }

        if(Validator.isDecimalMark(c, previewNext())) {
          this.errors.push(new TokenSyntaxError(`Digit expected, got "${c}"`))
        }
      } else if(c2 === '.') {
        next()
        this.errors.push(new TokenSyntaxError(`Digit expected, got "${c}"`))
      }
    }
  }

  /**
   * Skip any Comments when setting tokens
   * Called in nextToken()
   * @private
   */
  const nextComment = () => {
    const c = this.c
    while(c !== '\n' && c !== '') {
      this.comment += c
      next()
    }
  }

  /**
   * Skip any whitespace when setting tokens
   * Called in nextToken()
   * @private
   */
  const nextWhitespace = () => {
    while(Validator.isWhitespace(this.c, this.nesting_level)) {
      next()
    }
  }
}

Expression.prototype.set = function (expr) {
  this.expression = expr
}

Expression.prototype.first = function () {
  this.i = 0
  this.c = this.expression.charAt(0)
  this.nesting_level = 0
  this.conditional_level = null
}
