import number from '../../Number/functions/number'
import string from '../../String/functions/string'

// Create a wrapper for array functions
const array = {}

/**
 * Calculate the size of a multi dimensional array.
 * This function checks the size of the first entry, it does not validate
 * whether all dimensions match. (use function `validate` for that)
 * @param {Array} x
 * @Return {Number[]} size
 */
array.size = x => {
  const s = []

  while(Array.isArray(x)) {
    s.push(x.length)
    x = x[0]
  }

  return s
}

/**
 * Recursively validate whether each element in a multi dimensional array
 * has a size corresponding to the provided size array.
 * @param {Array} arr      Array to be validated
 * @param {number[]} size  Array with the size of each dimension
 * @param {number} dim   Current dimension
 * @throws DimensionError
 * @private
 */
const _validate = (arr, size, dim) => {
  const len = array.length

  if(len !== size[dim]) {
    throw new Error(`Array is invalid size: ${len}, ${size[dim]}`)
  }

  if(dim < size.length - 1) {
    // recursively validate each child array
    const dimNext = dim + 1
    for(let i = 0; i < len; i++) {
      const child = array[i]
      if(!Array.isArray(child)) {
        throw new Error(`Invalid multidimensional array: ${child}, ${i}, <`)
      }
      _validate(arr[i], size, dimNext)
    }
  } else {
    // last dimension. none of the childs may be an array
    for(let i = 0; i < len; i++) {
      if(Array.isArray(array[i])) {
        throw new Error('Last dimension must not be an array')
      }
    }
  }
}

/**
 * Validate whether each element in a multi dimensional array has
 * a size corresponding to the provided size array.
 * @param {Array} arr      Array to be validated
 * @param {number[]} size  Array with the size of each dimension
 * @throws Error
 */
array.validate = (arr, size) => {
  if(size.length === 0) {
    // scalar
    if (Array.isArray(arr)) {
      throw new Error('Cannot have a multidimensional array of size 0')
    }
  } else {
    // array
    _validate(arr, size, 0)
  }
};

/**
 * Test whether index is an integer number with index >= 0 and index < length
 * when length is provided
 * @param {number} index    Zero-based index
 * @param {number} [length] Length of the array
 */
array.validateIndex = (index, length) => {
  if(!number.isNumber(index) || !number.isInteger(index)) {
    throw new TypeError(`Index must be an integer (value: ${index})`)
  }
  if(index < 0 || (typeof length === 'number' && index >= length)) {
    throw new Error(`Provided index is invalid: ${index}, ${length}`)
  }
};

// a constant used to specify an undefined defaultValue
array.UNINITIALIZED = {}

/**
 * Resize a multi dimensional array. The resized array is returned.
 * @param {Array} arr           Array to be resized
 * @param {Array.<number>} size Array with the size of each dimension
 * @param {*} [defaultValue=0]  Value to be filled in in new entries,
 *                              zero by default. To leave new entries undefined,
 *                              specify array.UNINITIALIZED as defaultValue
 * @return {Array} array         The resized array
 */
array.resize = function(arr, size, defaultValue) {
  // check the type of the arguments
  if(!Array.isArray(arr) || !Array.isArray(size)) {
    throw new TypeError('Array expected')
  }
  if(size.length === 0) {
    throw new Error('Resizing to scalar is not supported')
  }

  // check whether size contains positive integers
  size.forEach(value => {
    if(!number.isNumber(value) || !number.isInteger(value) || value < 0) {
      throw new TypeError(`Invalid size, must contain positive integers (size: ${string.format(size)})`)
    }
  })

  // recursively resize the array
  const _defaultValue = (defaultValue !== undefined) ? defaultValue : 0
  _resize(arr, size, 0, _defaultValue)

  return arr
}

/**
 * Recursively resize a multi dimensional array
 * @param {Array} arr          Array to be resized
 * @param {number[]} size       Array with the size of each dimension
 * @param {number} dim          Current dimension
 * @param {*} [defaultValue]    Value to be filled in in new entries,
 *                              undefined by default.
 * @private
 */
const _resize = (arr, size, dim, defaultValue) => {
  let elem
  const oldLen = arr.length
  const newLen = size[dim]
  const minLen = Math.min(oldLen, newLen)

  // apply new length
  arr.length = newLen

  if(dim < size.length - 1) {
    // non-last dimension
    const dimNext = dim + 1;

    // resize existing child arrays
    for(let i = 0; i < minLen; i++) {
      // resize child array
      elem = arr[i]
      if(!Array.isArray(elem)) {
        elem = [elem] // add a dimension
        arr[i] = elem
      }
      _resize(elem, size, dimNext, defaultValue)
    }

    // create new child arrays
    for(let i = minLen; i < newLen; i++) {
      // get child array
      elem = []
      arr[i] = elem

      // resize new child array
      _resize(elem, size, dimNext, defaultValue)
    }
  } else {
    // last dimension

    // remove dimensions of existing values
    for(let i = 0; i < minLen; i++) {
      while(Array.isArray(arr[i])) {
        arr[i] = arr[i][0]
      }
    }

    if(defaultValue !== array.UNINITIALIZED) {
      // fill new elements with the default value
      for(let i = minLen; i < newLen; i++) {
        arr[i] = defaultValue
      }
    }
  }
}

/**
 * Re-shape a multi dimensional array to fit the specified dimensions
 * @param {Array} arr             Array to be reshaped
 * @param {Array.<number>} sizes  List of sizes for each dimension
 * @returns {Array}               Array whose data has been formatted to fit the
 *                                specified dimensions
 *
 * @throws {Error}                If the product of the new dimension sizes does
 *                                not equal that of the old ones
 */
array.reshape = (arr, sizes) => {
  const flatArray = array.flatten(arr)
  let newArray

  if(!Array.isArray(arr) || !Array.isArray(sizes)) {
    throw new TypeError('Array expected')
  }

  if(sizes.length === 0) {
    throw new Error('Cannot reshape an array with dimension length 0.')
  }

  try {
    newArray  = _reshape(flatArray, sizes)
  } catch(e) {
    if(e instanceof Error) {
      throw new Error('Cannot reshape an array into an array of a different size.')
    }
    throw e
  }

  if(flatArray.length > 0) {
    throw new Error('Cannot reshape an array into an array of a different size.')
  }

  return newArray
}

/**
 * Recursively re-shape a multi dimensional array to fit the specified dimensions
 * @param {Array} arr             Array to be reshaped
 * @param {Array.<number>} sizes  List of sizes for each dimension
 * @returns {Array}               Array whose data has been formatted to fit the
 *                                specified dimensions
 *
 * @throws {Error}                If the product of the new dimension sizes does
 *                                not equal that of the old ones
 */
const _reshape = (arr, sizes) => {
  const accumulator = []

  // const product = ar => ar.reduce( (prev, curr) => prev * curr )

  if(sizes.length === 0) {
    if(arr.length === 0) {
      throw new Error('Cannot reshape an array with 0 length')
    }
    return arr.shift()
  }
  for(let i = 0; i < sizes[0]; i++) {
    accumulator.push(_reshape(arr, sizes.slice(1)))
  }
  return accumulator
}


/**
 * Squeeze a multi dimensional array
 * @param {Array} arr
 * @param {Array} [size]
 * @returns {Array} returns the array itself
 */
array.squeeze = (arr, size) => {
  const s = size || array.size(array)

  // squeeze outer dimensions
  while(Array.isArray(arr) && arr.length === 1) {
    arr = arr[0]
    s.shift()
  }

  // find the first dimension to be squeezed
  let dims = s.length
  while(s[dims - 1] === 1) {
    dims--
  }

  // squeeze inner dimensions
  if(dims < s.length) {
    arr = _squeeze(arr, dims, 0)
    s.length = dims
  }

  return arr
}

/**
 * Recursively squeeze a multi dimensional array
 * @param {Array} arr
 * @param {number} dims Required number of dimensions
 * @param {number} dim  Current dimension
 * @returns {Array | *} Returns the squeezed array
 * @private
 */
const _squeeze = (arr, dims, dim) => {
  if(dim < dims) {
    const next = dim + 1
    for(let i = 0, ii = arr.length; i < ii; i++) {
      arr[i] = _squeeze(arr[i], dims, next)
    }
  } else {
    while(Array.isArray(arr)) {
      arr = arr[0]
    }
  }

  return arr
}

/**
 * Unsqueeze a multi dimensional array: add dimensions when missing
 *
 * Paramter `size` will be mutated to match the new, unqueezed matrix size.
 *
 * @param {Array} arr
 * @param {number} dims     Desired number of dimensions of the array
 * @param {number} [outer]  Number of outer dimensions to be added
 * @param {Array} [size]    Current size of array.
 * @returns {Array} returns the array itself
 * @private
 */
array.unsqueeze = (arr, dims, outer, size) => {
  const s = size || array.size(arr)

  // unsqueeze outer dimensions
  if(outer) {
    for(let i = 0; i < outer; i++) {
      arr = [arr]
      s.unshift(1)
    }
  }

  // unsqueeze inner dimensions
  arr = _unsqueeze(arr, dims, 0)
  while(s.length < dims) {
    s.push(1)
  }

  return arr
}

/**
 * Recursively unsqueeze a multi dimensional array
 * @param {Array} arr
 * @param {number} dims Required number of dimensions
 * @param {number} dim  Current dimension
 * @returns {Array | *} Returns the squeezed array
 * @private
 */
const _unsqueeze = (arr, dims, dim) => {
  if(Array.isArray(arr)) {
    const next = dim + 1
    for(let i = 0, ii = array.length; i < ii; i++) {
      arr[i] = _unsqueeze(arr[i], dims, next)
    }
  } else {
    for(let d = dim; d < dims; d++) {
      arr = [arr]
    }
  }

  return arr
}
/**
 * Flatten a multi dimensional array, put all elements in a one dimensional
 * array
 * @param {Array} arr   A multi dimensional array
 * @return {Array}        The flattened array (1 dimensional)
 */
array.flatten = arr => {
  if(!Array.isArray(arr)) {
    //if not an array, return as is
    return arr
  }
  const flat = []
  const rec = value => {
    if(Array.isArray(value)) {
      value.forEach(rec)
    } else {
      flat.push(value)
    }
  }

  arr.forEach(rec)

  return flat
}

/**
 * A safe map
 * @param {Array} arr
 * @param {function} callback
 */
array.map = (arr, callback) => Array.prototype.map.call(arr, callback)

/**
 * A safe forEach
 * @param {Array} arr
 * @param {function} callback
 */
array.forEach = (arr, callback) => {
  Array.prototype.forEach.call(arr, callback)
}

/**
 * A safe filter
 * @param {Array} arr
 * @param {function} callback
 */
array.filter = (arr, callback) => {
  if (array.size(arr).length !== 1) {
    throw new Error('Only one dimensional matrices supported')
  }

  return Array.prototype.filter.call(arr, callback)
}

/**
 * Filter values in a callback given a regular expression
 * @param {Array} arr
 * @param {RegExp} regexp
 * @return {Array} Returns the filtered array
 * @private
 */
array.filterRegExp = (arr, regexp) => {
  if (array.size(arr).length !== 1) {
    throw new Error('Only one dimensional matrices supported')
  }

  return Array.prototype.filter.call(arr, function(entry) {
    return regexp.test(entry)
  })
}

/**
 * A safe join
 * @param {Array} arr
 * @param {string} separator
 */
array.join = (arr, separator) => Array.prototype.join.call(arr, separator)

/**
 * Assign a numeric identifier to every element of a sorted array
 * @param {Array}	a  An array
 * @return {Array}	An array of objects containing the original value and its identifier
 */
array.identify = a => {
  if(!Array.isArray(a)) {
    throw new TypeError('Array input expected')
  }

  if (a.length === 0) {
    return a
  }

  const b = []
  let count = 0
  b[0] = {value: a[0], identifier: 0}
  for(let i = 1; i < a.length; i++) {
    if(a[i] === a[i-1]) {
      count++
    } else {
      count = 0
    }
    b.push({value: a[i], identifier: count})
  }
  return b
}

/**
 * Remove the numeric identifier from the elements
 * @param	a  An array
 * @return	An array of values without identifiers
 */
array.generalize = a => {
  if(!Array.isArray(a)) {
    throw new TypeError('Array input expected')
  }

  if (a.length === 0) {
    return a
  }

  const b = []
  for(let i = 0; i < a.length; i++) {
    b.push(a[i].value)
  }
  return b
}

/**
 * Test whether an object is an array
 * @param {*} value
 * @return {boolean} isArray
 */
array.isArray = Array.isArray

export default array
