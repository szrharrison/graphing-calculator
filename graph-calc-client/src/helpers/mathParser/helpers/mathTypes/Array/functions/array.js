import number from '../../Number/functions/number'

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
 * @param {Array} array    Array to be validated
 * @param {number} size  Array with the size of each dimension
 * @param {number} dim   Current dimension
 * @private
 */
const _validate = (array, size, dim) => {
  let i
  const len = array.length

  if(len !== size[dim]) {
    throw new Error(`len !== size[dim]: ${len} !== size[${dim}]: size[dim] = ${size[dim]}`)
  }

  if(dim < size.length - 1) {
    // recursively validate each child array
    let dimNext = dim + 1
    for(i = 0; i < len; i++) {
      const child = array[i]
      if(!Array.isArray(child)) {
        throw new Error(`${child} is not an array`)
      }
      _validate(array[i], size, dimNext)
    }
  } else {
    // last dimension. none of the childs may be an array
    for(i = 0; i < len; i++) {
      if (Array.isArray(array[i])) {
        throw new Error(`${array[i]} may not be an array, last dimension`)
      }
    }
  }
}

/**
 * Validate whether each element in a multi dimensional array has
 * a size corresponding to the provided size array.
 * @param {Array} array    Array to be validated
 * @param {number} size  Array with the size of each dimension
 */
array.validate = (array, size) => {
  const isScalar = (size.length === 0)
  if(isScalar) {
    if(Array.isArray(array)) {
      throw new Error(`Array: ${array} has undefined dimensions: ${size}`)
    }
  } else {
    // array
    _validate(array, size, 0)
  }
}

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
    throw new Error(`Index ${index} not included in array of size ${length}`)
  }
}

export default array
