class Validator {
  /**
  * Checks whether the current character `c` is a valid alpha character:
  *
  * - A latin letter (upper or lower case) Ascii: a-z, A-Z
  * - An underscore                        Ascii: _
  * - A dollar sign                        Ascii: $
  * - A latin letter with accents          Unicode: \u00C0 - \u02AF
  * - A greek letter                       Unicode: \u0370 - \u03FF
  * - A mathematical alphanumeric symbol   Unicode: \u{1D400} - \u{1D7FF} excluding invalid code points
  *
  * The previous and next characters are needed to determine whether
  * this character is part of a unicode surrogate pair.
  *
  * @param {string} c      Current character in the expression
  * @param {string} cPrev  Previous character
  * @param {string} cNext  Next character
  * @return {boolean}
  * @private
  */
  static isAlpha = (c, cPrev, cNext) => {
    return Validator.isValidLatinOrGreek(c)
    || Validator.isValidMathSymbol(c, cNext)
    || Validator.isValidMathSymbol(cPrev, c)
  }

  /**
  * Test whether a character is a valid latin, greek, or letter-like character
  * @param {string} c
  * @return {boolean}
  * @private
  */
  static isValidLatinOrGreek = c => {
    return /^[a-zA-Z_$\u00c0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(c)
  }

  /**
  * Test whether two given 16 bit characters form a surrogate pair of a
  * unicode math symbol.
  *
  * http://unicode-table.com/en/
  * http://www.wikiwand.com/en/Mathematical_operators_and_symbols_in_Unicode
  *
  * Note: In ES6 will be unicode aware:
  * http://stackoverflow.com/questions/280712/javascript-unicode-regexes
  * https://mathiasbynens.be/notes/es6-unicode-regex
  *
  * @param {string} high
  * @param {string} low
  * @return {boolean}
  * @private
  */
  static isValidMathSymbol = (high, low) => {
    return /^[\uD835]$/.test(high) &&
    /^[\uDC00-\uDFFF]$/.test(low) &&
    /^[^\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA]$/.test(low) &&
    /^[\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45]$/.test(low) &&
    /^[\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]$/.test(low)
  }

  /**
  * Check whether given character c is a white space character: space, tab, or enter
  * @param {string} c
  * @param {number} nestingLevel
  * @return {boolean}
  * @private
  */
  static isWhitespace = (c, nestingLevel) => {
    return (
      c === ' ' ||
      c === '\t' ||
      (c === '\n' && nestingLevel > 0)
    )
  }

  /**
  * Test whether the character c is a decimal mark (dot).
  * This is the case when it's not the start of a delimiter '.*', './', or '.^'
  * @param {string} c
  * @param {string} cNext
  * @return {boolean}
  * @private
  */
  static isDecimalMark = (c, cNext) => {
    return (c == '.' && cNext !== '/' && cNext !== '*' && cNext !== '^')
  }

  /**
  * checks if the given char c is a digit or dot
  * @param {string} c   a string with one character
  * @return {boolean}
  * @private
  */
  static isDigitDot = c => {
    return /[0-9.]/.test(c)
  }

  /**
  * checks if the given char c is a digit
  * @param {string} c   a string with one character
  * @return {boolean}
  * @private
  */
  static isDigit = c => {
    return /[0-9]/.test(c)
  }
}

export default Validator
