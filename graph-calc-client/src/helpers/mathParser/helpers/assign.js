import subset from './subset'
import matrix from './mathTypes/Matrix/functions/matrix'
import objFunctions from './mathTypes/Object/functions/object'

const { setSafeProperty } = objFunctions

/**
 * Replace part of an object:
 *
 * - Assign a property to an object
 * - Replace a part of a string
 * - Replace a matrix subset
 *
 * @param {Object | Array | Matrix | string} object
 * @param {Index} index
 * @param {*} value
 * @return {Object | Array | Matrix | string} Returns the original object
 *                                            except in case of a string
 */
const assign = (object, index, value) => {
  try {
    switch (true) {
      case Array.isArray(object):
        return matrix(object).subset(index, value).valueOf()
      case object && typeof object.subset === 'function':   // Matrix
        return object.subset(index, value)
      case typeof object === 'string':
        return subset(object, index, value)
      case typeof object === 'object':
        if(!index.isObjectProperty()) {
          throw TypeError('Cannot apply a numeric index as object property');
        }
        setSafeProperty(object, index.getObjectProperty(), value)
        return object
      default:
        throw new TypeError('Cannot apply index: unsupported type of object')
    }
  } catch(err) {
      throw new Error(err)
  }
}

export default assign
