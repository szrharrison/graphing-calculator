// Create a wrapper object for object functions
const object = {}

/**
 * Clone an object
 *
 *     clone(x)
 *
 * Can clone any primitive type, array, and object.
 * If x has a function clone, this function will be invoked to clone the object.
 *
 * @param {*} x
 * @return {*} clone
 */
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
   * returns a Boolean object with a value of false. Since all objects are truthy,
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

/**
 * Apply map to all properties of an object
 * @param {Object} object
 * @param {function} callback
 * @return {Object} Returns a copy of the object with mapped properties
 */
object.map = (obj, callback) => {
  const clone = {}

  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      clone[key] = callback(obj[key])
    }
  }

  return clone
}

/**
 * Extend object a with the properties of object b
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */
object.extend = (a, b) => {
  for(let prop in b) {
    if(b.hasOwnProperty(prop)) {
      a[prop] = b[prop]
    }
  }
  return a
}

/**
 * Deep extend an object a with the properties of object b
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
object.deepExtend = (a, b) => {
  if(Array.isArray(b)) {
    throw new TypeError('Arrays are not supported by deepExtend')
  }

  for(let prop in b) {
    if(b.hasOwnProperty(prop)) {
      if(b[prop] && b[prop].constructor === Object) {
        if(a[prop] === undefined) {
          a[prop] = {}
        }
        if(a[prop].constructor === Object) {
          object.deepExtend(a[prop], b[prop])
        } else {
          a[prop] = b[prop]
        }
      } else if(Array.isArray(b[prop])) {
        throw new TypeError('Arrays are not supported by deepExtend')
      } else {
        a[prop] = b[prop]
      }
    }
  }
  return a
}

/**
 * Deep test equality of all fields in two pairs of arrays or objects.
 * @param {Array | Object} a
 * @param {Array | Object} b
 * @returns {boolean}
 */
object.deepEqual = (a, b) => {
  let prop
  if(Array.isArray(a)) {
    if(!Array.isArray(b)) {
      return false
    }

    if(a.length !== b.length) {
      return false
    }

    for(let i = 0, len = a.length; i < len; i++) {
      if(!object.deepEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  } else if(a instanceof Object) {
    if(Array.isArray(b) || !(b instanceof Object)) {
      return false
    }

    for(prop in a) {
      //noinspection JSUnfilteredForInLoop
      if(!object.deepEqual(a[prop], b[prop])) {
        return false
      }
    }
    for(prop in b) {
      //noinspection JSUnfilteredForInLoop
      if(!object.deepEqual(a[prop], b[prop])) {
        return false
      }
    }
    return true
  } else {
    // Using == instead of === in case type conversion was intended
    return (typeof a === typeof b) && (a == b)      // eslint-disable-line
  }
}

/**
 * Test whether the current JavaScript engine supports Object.defineProperty
 * @returns {boolean} returns true if supported
 */
object.canDefineProperty = () => {
  // test needed for broken IE8 implementation
  try {
    if (Object.defineProperty) {
      Object.defineProperty({}, 'x', { get: function() {} })
      return true
    }
  } catch(e) {
    return false
  }
}

/**
 * Attach a lazy loading property to a constant.
 * The given function `fn` is called once when the property is first requested.
 * On older browsers (<IE8), the function will fall back to direct evaluation
 * of the properties value.
 * @param {Object} object   Object where to add the property
 * @param {string} prop     Property name
 * @param {Function} fn     Function returning the property value. Called
 *                          without arguments.
 */
object.lazy = (obj, prop, fn) => {
  if(object.canDefineProperty()) {
    let _value
    let _uninitialized = true
    Object.defineProperty(obj, prop, {
      get: () => {
          if (_uninitialized) {
            _value = fn()
            _uninitialized = false
          }
          return _value
        },
      set: (value) => {
          _value = value
          _uninitialized = false
        },
      configurable: true,
      enumerable: true
    })
  } else {
    // fall back to immediate evaluation
    obj[prop] = fn()
  }
}

/**
 * Traverse a path into an object.
 * When a namespace is missing, it will be created
 * @param {Object} object
 * @param {string} path   A dot separated string like 'name.space'
 * @return {Object} Returns the object at the end of the path
 */
object.traverse = (obj, path) => {
  let ob = obj

  if(path) {
    const names = path.split('.')
    for(let i = 0; i < names.length; i++) {
      const name = names[i]
      if(!(name in ob)) {
        ob[name] = {}
      }
      ob = ob[name]
    }
  }

  return ob
}

export default object
