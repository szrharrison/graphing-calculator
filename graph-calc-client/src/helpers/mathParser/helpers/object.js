import isBigNumber from './BigNumber'

export const clone = x => {
  const type = typeof x

  if(type === 'number' || type === 'string' || type === 'boolean' || x === null || x === undefined) {
    return x
  }

  if(typeof x.clone === 'function') {
    return x.clone()
  }

  if(Array.isArray(x)) {
    return x.map( value => clone(value) )
  }

  switch (true) {
    case x instanceof Number:
      return new Number(x.valueOf())
    case x instanceof String:
      return new String(x.valueOf())
    case x instanceof Boolean:
      return new Boolean(x.valueOf())
    case x instanceof Date:
      return new Date(x.valueOf())
    case isBigNumber(x):
      return x
    case x instanceof RegExp:
      throw new TypeError(`Cannot clone ${x}`)
    default:
      return map(x, clone)
  }
}

/**
 * Get a property of a plain object
 * Throws an error in case the object is not a plain object or the
 * property is not defined on the object itself
 * @param {Object} object
 * @param {string} prop
 * @return {*} Returns the property value when safe
 */
export const getSafeProperty = (object, prop) => {
  if(isPlainObject(object) && isSafeProperty(object, prop)) {
    return object[prop]
  }

  if(typeof object[prop] === 'function' && isSafeMethod(object, prop)) {
    throw new Error(`Cannot access method ${prop} as a property`)
  }

  throw new Error(`No access to property "${prop}"`)
}

/**
 * Set a property on a plain object.
 * Throws an error in case the object is not a plain object or the
 * property would override an inherited property like .constructor or .toString
 * @param {Object} object
 * @param {string} prop
 * @param {*} value
 * @return {*} Returns the value
 */
export const setSafeProperty = (object, prop, value) => {
  // only allow setting safe properties of a plain object
  if(isPlainObject(object) && isSafeProperty(object, prop)) {
    return object[prop] = value
  }

  throw new Error(`No access to property "${prop}"`)
}

/**
 * Test whether a property is safe to use for an object.
 * For example .toString and .constructor are not safe
 * @param {string} prop
 * @return {boolean} Returns true when safe
 */
export const isSafeProperty = (object, prop) => {
  if(!object || typeof object !== 'object') {
    return false
  }
  // SAFE: whitelisted
  // e.g length
  if(hasOwnProperty(safeNativeProperties, prop)) {
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
 * @param {Object} object
 * @param {string} method
 */
export const validateSafeMethod = (object, method) => {
  if(!isSafeMethod(object, method)) {
    throw new Error(`No access to method "${method}"`)
  }
}

/**
 * Check whether a method is safe.
 * Throws an error when that's not the case (for example for `constructor`).
 * @param {Object} object
 * @param {string} method
 * @return {boolean} Returns true when safe, false otherwise
 */
export const isSafeMethod = (object, method) => {
  if(!object || typeof object[method] !== 'function') {
    return false
  }
  // UNSAFE: ghosted
  // e.g overridden toString
  if(object.hasOwnProperty(method) &&
      (object.__proto__ && (method in object.__proto__))) {
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

export const isPlainObject = object => typeof object === 'object' && object && object.constructor === Object

const safeNativeProperties = {
  length: true,
  name: true
}

const safeNativeMethods = {
  toString: true,
  valueOf: true,
  toLocaleString: true
}
