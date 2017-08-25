// Create a wrapper object for number functions
const number = {}

/**
 * Test whether value is a number
 * @param {*} value
 * @return {boolean} isNumber
 */
number.isNumber = value => typeof value === 'number'

/**
 * Check if a number is integer
 * @param {number | boolean} value
 * @return {boolean} isInteger
 */
number.isInteger = value => {
  return isFinite(value)
      ? (value == Math.round(value))
      : false
  // Note: we use ==, not ===, as we can have Booleans as well
}

/**
 * Calculate the sign of a number
 * @param {number} x
 * @returns {*}
 */
number.sign = Math.sign || x => {
  if(x > 0) {
    return 1
  } else if(x < 0) {
    return -1
  } else {
    return 0
  }
}

/**
 * Split a number into sign, coefficients, and exponent
 * @param {number | string} value
 * @return {SplitValue}
 *              Returns an object containing sign, coefficients, and exponent
 */
number.splitNumber = value => {
  // parse the input value
  const match = String(value).toLowerCase().match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/)
  if(!match) {
    throw new SyntaxError(`Invalid number ${value}`)
  }

  const sign         = match[1]
  const digits       = match[2]
  let exponent       = parseFloat(match[4] || '0')

  const dot = digits.indexOf('.');
  exponent += (dot !== -1) ? (dot - 1) : (digits.length - 1);

  const coefficients = digits
      .replace('.', '')  // remove the dot (must be removed before removing leading zeros)
      .replace(/^0*/, zeros => {
        // remove leading zeros, add their count to the exponent
        exponent -= zeros.length
        return ''
      })
      .replace(/0*$/, '') // remove trailing zeros
      .split('')
      .map(d => parseInt(d))

  if(coefficients.length === 0) {
    coefficients.push(0)
    exponent++
  }

  return { sign, coefficients, exponent }
}

export default number
