// Create a wrapper object for object functions
const object = {}

object.clone = x => {
  const type = typeof x

  if(type === 'number' || type === 'string' || type === 'boolean' || x === null || x === undefined) {
    return x
  }

  if(typeof x.clone === 'function') {
    return x.clone()
  }

  if(Array.isArray(x)) {
    return x.map( value => object.clone(value) )
  }

  /* Note that using constructor methods for primitive types is discouraged as
   * they return objects (instead of the primative type). E.g. new Boolean(false)
   * returns a Boolean object with a value of false. Since all objects are truty,
   * if(new Boolean(false)) {...} will always run.
   */
  switch (true) {
    case x instanceof Number:
      return new Number(x.valueOf())    // eslint-disable-line
    case x instanceof String:
      return new String(x.valueOf())    // eslint-disable-line
    case x instanceof Boolean:
      return new Boolean(x.valueOf())   // eslint-disable-line
    case x instanceof Date:
      return new Date(x.valueOf())
    case type.isBigNumber(x):
      return x
    case x instanceof RegExp:
      throw new TypeError(`Cannot clone ${x}`)
    default:
      return object.map(x, object.clone)
  }
}

/**
 * Get a property of a plain object
 * Throws an error in case the object is not a plain object or the
 * property is not defined on the object itself
 * @param {Object} obj
 * @param {string} prop
 * @return {*} Returns the property value when safe
 */
object.getSafeProperty = (obj, prop) => {
  if(object.isPlainObject(obj) && object.isSafeProperty(obj, prop)) {
    return obj[prop]
  }

  if(typeof obj[prop] === 'function' && object.isSafeMethod(obj, prop)) {
    throw new Error(`Cannot access method ${prop} as a property`)
  }

  throw new Error(`No access to property "${prop}"`)
}

/**
 * Set a property on a plain object.
 * Throws an error in case the object is not a plain object or the
 * property would override an inherited property like .constructor or .toString
 * @param {Object} obj
 * @param {string} prop
 * @param {*} value
 * @return {*} Returns the value
 */
object.setSafeProperty = (obj, prop, value) => {
  // only allow setting safe properties of a plain object
  if(object.isPlainObject(obj) && object.isSafeProperty(obj, prop)) {
    return obj[prop] = value
  }

  throw new Error(`No access to property "${prop}"`)
}

/**
 * Test whether a property is safe to use for an object.
 * For example .toString and .constructor are not safe
 * @param {string} prop
 * @return {boolean} Returns true when safe
 */
object.isSafeProperty = (object, prop) => {
  if(!object || typeof object !== 'object') {
    return false
  }
  // SAFE: whitelisted
  // e.g length
  if(prop.hasOwnProperty(safeNativeProperties)) {
    return true
  }
  // UNSAFE: inherited from Object prototype
  // e.g constructor
  if(prop in Object.prototype) {
    return false
  }
  // UNSAFE: inherited from Function prototype
  // e.g call, apply
  if(prop in Function.prototype) {
    return false
  }
  return true
}

/**
 * Validate whether a method is safe.
 * Throws an error when that's not the case.
 * @param {Object} obj
 * @param {string} method
 */
object.validateSafeMethod = (obj, method) => {
  if(!object.isSafeMethod(obj, method)) {
    throw new Error(`No access to method "${method}"`)
  }
}

/**
 * Check whether a method is safe.
 * Throws an error when that's not the case (for example for `constructor`).
 * @param {Object} obj
 * @param {string} method
 * @return {boolean} Returns true when safe, false otherwise
 */
object.isSafeMethod = (obj, method) => {
  if(!obj || typeof obj[method] !== 'function') {
    return false
  }
  // UNSAFE: ghosted
  // e.g overridden toString
  if(obj.hasOwnProperty(method) &&
      (obj.__proto__ && (method in obj.__proto__))) {
    return false
  }
  // SAFE: whitelisted
  // e.g toString
  if(safeNativeMethods.hasOwnProperty(method)) {
    return true
  }
  // UNSAFE: inherited from Object prototype
  // e.g constructor
  if(method in Object.prototype) {
    return false
  }
  // UNSAFE: inherited from Function prototype
  // e.g call, apply
  if (method in Function.prototype) {
    return false
  }
  return true
}

object.isPlainObject = obj => (typeof obj === 'object' && obj && obj.constructor === Object)

const safeNativeProperties = {
  length: true,
  name: true
}

const safeNativeMethods = {
  toString: true,
  valueOf: true,
  toLocaleString: true
}

export default object
