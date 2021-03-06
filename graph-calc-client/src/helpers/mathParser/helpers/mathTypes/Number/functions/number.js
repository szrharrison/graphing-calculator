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
 * Note: we use ==, not ===, as we can have Booleans as well
 */
number.isInteger = value => {
  return isFinite(value)
      ? (value == Math.round(value))  // eslint-disable-line
      : false
}

/**
 * Calculate the sign of a number
 * @param {number} x
 * @returns {*}
 */
number.sign = Math.sign || function(x) {
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
      .map( d => parseInt(d, 10) )

  if(coefficients.length === 0) {
    coefficients.push(0)
    exponent++
  }

  return { sign, coefficients, exponent }
}

/**
 * Convert a number to a formatted string representation.
 *
 * Syntax:
 *
 *    format(value)
 *    format(value, options)
 *    format(value, precision)
 *    format(value, fn)
 *
 * Where:
 *
 *    {number} value   The value to be formatted
 *    {Object} options An object with formatting options. Available options:
 *                     {string} notation
 *                         Number notation. Choose from:
 *                         'fixed'          Always use regular number notation.
 *                                          For example '123.40' and '14000000'
 *                         'exponential'    Always use exponential notation.
 *                                          For example '1.234e+2' and '1.4e+7'
 *                         'engineering'    Always use engineering notation.
 *                                          For example '123.4e+0' and '14.0e+6'
 *                         'auto' (default) Regular number notation for numbers
 *                                          having an absolute value between
 *                                          `lower` and `upper` bounds, and uses
 *                                          exponential notation elsewhere.
 *                                          Lower bound is included, upper bound
 *                                          is excluded.
 *                                          For example '123.4' and '1.4e7'.
 *                     {number} precision   A number between 0 and 16 to round
 *                                          the digits of the number.
 *                                          In case of notations 'exponential' and
 *                                          'auto', `precision` defines the total
 *                                          number of significant digits returned
 *                                          and is undefined by default.
 *                                          In case of notation 'fixed',
 *                                          `precision` defines the number of
 *                                          significant digits after the decimal
 *                                          point, and is 0 by default.
 *                     {Object} exponential An object containing two parameters,
 *                                          {number} lower and {number} upper,
 *                                          used by notation 'auto' to determine
 *                                          when to return exponential notation.
 *                                          Default values are `lower=1e-3` and
 *                                          `upper=1e5`.
 *                                          Only applicable for notation `auto`.
 *    {Function} fn    A custom formatting function. Can be used to override the
 *                     built-in notations. Function `fn` is called with `value` as
 *                     parameter and must return a string. Is useful for example to
 *                     format all values inside a matrix in a particular way.
 *
 * Examples:
 *
 *    format(6.4);                                        // '6.4'
 *    format(1240000);                                    // '1.24e6'
 *    format(1/3);                                        // '0.3333333333333333'
 *    format(1/3, 3);                                     // '0.333'
 *    format(21385, 2);                                   // '21000'
 *    format(12.071, {notation: 'fixed'});                // '12'
 *    format(2.3,    {notation: 'fixed', precision: 2});  // '2.30'
 *    format(52.8,   {notation: 'exponential'});          // '5.28e+1'
 *    format(12345678, {notation: 'engineering'});        // '12.345678e+6'
 *
 * @param {number} value
 * @param {Object | Function | number} [options]
 * @return {string} str The formatted value
 */
number.format = (value, options) => {
  if(typeof options === 'function') {
    // handle format(value, fn)
    return options(value)
  }

  // handle special cases
  if(value === Infinity) {
    return 'Infinity'
  } else if(value === -Infinity) {
    return '-Infinity'
  } else if(isNaN(value)) {
    return 'NaN'
  }

  // default values for options
  let notation = 'auto'
  let precision = undefined

  if(options) {
    // determine notation from options
    if(options.notation) {
      notation = options.notation
    }

    // determine precision from options
    if(number.isNumber(options)) {
      precision = options
    } else if(options.precision) {
      precision = options.precision
    }
  }

  // handle the various notations
  switch (notation) {
    case 'fixed':
      return number.toFixed(value, precision)

    case 'exponential':
      return number.toExponential(value, precision)

    case 'engineering':
      return number.toEngineering(value, precision)

    case 'auto':
      return number.toPrecision(value, precision, options && options.exponential)
          // remove trailing zeros after the decimal point
          .replace(/((\.\d*?)(0+))($|e)/, function () {
            const digits = arguments[2]
            const e = arguments[4]
            return (digits !== '.') ? digits + e : e;
          })

    default:
      throw new Error(`Unknown notation "${notation}". Choose "auto", "exponential", or "fixed".`)
  }
}

/**
 * Count the number of significant digits of a number.
 *
 * For example:
 *   2.34 returns 3
 *   0.0034 returns 2
 *   120.5e+30 returns 4
 *
 * @param {number} value
 * @return {number} digits   Number of significant digits
 */
number.digits = value => {
  return number
      .toExponential(value)
      .replace(/e.*$/, '')          // remove exponential notation
      .replace( /^0\.?0*|\./, '')   // remove decimal point and leading zeros
      .length
}

/**
 * Format a number in exponential notation. Like '1.23e+5', '2.3e+0', '3.500e-3'
 * @param {number | string} value
 * @param {number} [precision]  Number of digits in formatted output.
 *                              If not provided, the maximum available digits
 *                              is used.
 */
number.toExponential = (value, precision) => {
  if(isNaN(value) || !isFinite(value)) {
    return String(value)
  }

  // round if needed, else create a clone
  const split = number.splitNumber(value)
  const rounded = precision ? number.roundDigits(split, precision) : split
  let c = rounded.coefficients
  const e = rounded.exponent

  // append zeros if needed
  if(c.length < precision) {
    c = c.concat(zeros(precision - c.length))
  }

  // format as `C.CCCe+EEE` or `C.CCCe-EEE`
  const first = c.shift()
  return `${rounded.sign}${first}${c.length > 0 ? ('.' + c.join('')) : ''}e${e >= 0 ? '+' : ''}${e}`
}

/**
 * Create an array filled with zeros.
 * @param {number} length
 * @return {Array}
 */
function zeros(length) {
  var arr = new Array(length)
  arr.fill(0)
  return arr
}

export default number
