import typedFunction from 'typed-function'
import numFunctions from './mathTypes/Number/functions/number'

const { digits } = numFunctions

const type = {}

let createTyped = () => {
  // initially, return the original instance of typed-function
  // consecutively, return a new instance from typed.create.
  createTyped = typedFunction.create
  return typedFunction
}

/**
 * Function for creating a new typed instance
 * @param {Object} type   Object with data types like Complex and BigNumber
 * @returns {Function}
 */
const create = (type) => {
  // type checks for all known types
  //
  // note that:
  //
  // - check by duck-typing on a property like `isUnit`, instead of checking instanceof.
  //   instanceof cannot be used because that would not allow to pass data from
  //   one instance of math.js to another since each has it's own instance of Unit.
  // - check the `isUnit` property via the constructor, so there will be no
  //   matches for "fake" instances like plain objects with a property `isUnit`.
  //   That is important for security reasons.
  // - It must not be possible to override the type checks used internally,
  //   for security reasons, so these functions are not exposed in the expression
  //   parser.
  type.isNumber = x => (typeof x === 'number')
  type.isComplex = x => ((type.Complex && x instanceof type.Complex) || false)
  type.isBigNumber = x => ((x && x.constructor.prototype.isBigNumber) || false)
  type.isFraction = x => ((type.Fraction && x instanceof type.Fraction) || false)
  type.isUnit = x => ((x && x.constructor.prototype.isUnit) || false)
  type.isString = x => (typeof x === 'string')
  type.isArray = Array.isArray
  type.isMatrix = x => ((x && x.constructor.prototype.isMatrix) || false)
  type.isDenseMatrix = x => ((x && x.isDenseMatrix && x.constructor.prototype.isMatrix) || false)
  type.isSparseMatrix = x => ((x && x.isSparseMatrix && x.constructor.prototype.isMatrix) || false)
  type.isRange = x => ((x && x.constructor.prototype.isRange) || false)
  type.isIndex = x => ((x && x.constructor.prototype.isIndex) || false)
  type.isBoolean = x => (typeof x === 'boolean')
  type.isResultSet = x => ((x && x.constructor.prototype.isResultSet) || false)
  type.isHelp = x => ((x && x.constructor.prototype.isHelp) || false)
  type.isFunction = x => (typeof x === 'function')
  type.isDate = x => (x instanceof Date)
  type.isRegExp = x => (x instanceof RegExp)
  type.isObject = x => (typeof x === 'object')
  type.isNull = x => (x === null)
  type.isUndefined = x => (x === undefined)

  type.isAccessorNode = x => ((x && x.isAccessorNode && x.constructor.prototype.isNode) || false)
  type.isArrayNode = x => ((x && x.isArrayNode && x.constructor.prototype.isNode) || false)
  type.isAssignmentNode = x => ((x && x.isAssignmentNode && x.constructor.prototype.isNode) || false)
  type.isBlockNode = x => ((x && x.isBlockNode && x.constructor.prototype.isNode) || false)
  type.isConditionalNode = x => ((x && x.isConditionalNode && x.constructor.prototype.isNode) || false)
  type.isConstantNode = x => ((x && x.isConstantNode && x.constructor.prototype.isNode) || false)
  type.isFunctionAssignmentNode = x => ((x && x.isFunctionAssignmentNode && x.constructor.prototype.isNode) || false)
  type.isFunctionNode = x => ((x && x.isFunctionNode && x.constructor.prototype.isNode) || false)
  type.isIndexNode = x => ((x && x.isIndexNode && x.constructor.prototype.isNode) || false)
  type.isNode = x => ((x && x.isNode && x.constructor.prototype.isNode) || false)
  type.isObjectNode = x => ((x && x.isObjectNode && x.constructor.prototype.isNode) || false)
  type.isOperatorNode = x => ((x && x.isOperatorNode && x.constructor.prototype.isNode) || false)
  type.isParenthesisNode = x => ((x && x.isParenthesisNode && x.constructor.prototype.isNode) || false)
  type.isRangeNode = x => ((x && x.isRangeNode && x.constructor.prototype.isNode) || false)
  type.isSymbolNode = x => ((x && x.isSymbolNode && x.constructor.prototype.isNode) || false)

  type.isChain = x => ((x && x.constructor.prototype.isChain) || false)

  // get a new instance of typed-function
  const typed = createTyped()

  // define all types. The order of the types determines in which order function
  // arguments are type-checked (so for performance it's important to put the
  // most used types first).
  typed.types = [
    { name: 'number',                    test: type.isNumber },
    { name: 'Complex',                   test: type.isComplex },
    { name: 'BigNumber',                 test: type.isBigNumber },
    { name: 'Fraction',                  test: type.isFraction },
    { name: 'Unit',                      test: type.isUnit },
    { name: 'string',                    test: type.isString },
    { name: 'Array',                     test: type.isArray },
    { name: 'Matrix',                    test: type.isMatrix },
    { name: 'DenseMatrix',               test: type.isDenseMatrix },
    { name: 'SparseMatrix',              test: type.isSparseMatrix },
    { name: 'Range',                     test: type.isRange },
    { name: 'Index',                     test: type.isIndex },
    { name: 'boolean',                   test: type.isBoolean },
    { name: 'ResultSet',                 test: type.isResultSet },
    { name: 'Help',                      test: type.isHelp },
    { name: 'function',                  test: type.isFunction },
    { name: 'Date',                      test: type.isDate },
    { name: 'RegExp',                    test: type.isRegExp },
    { name: 'Object',                    test: type.isObject },
    { name: 'null',                      test: type.isNull },
    { name: 'undefined',                 test: type.isUndefined },

    { name: 'OperatorNode',              test: type.isOperatorNode },
    { name: 'ConstantNode',              test: type.isConstantNode },
    { name: 'SymbolNode',                test: type.isSymbolNode },
    { name: 'ParenthesisNode',           test: type.isParenthesisNode },
    { name: 'FunctionNode',              test: type.isFunctionNode },
    { name: 'FunctionAssignmentNode',    test: type.isFunctionAssignmentNode },
    { name: 'ArrayNode',                 test: type.isArrayNode },
    { name: 'AssignmentNode',            test: type.isAssignmentNode },
    { name: 'BlockNode',                 test: type.isBlockNode },
    { name: 'ConditionalNode',           test: type.isConditionalNode },
    { name: 'IndexNode',                 test: type.isIndexNode },
    { name: 'RangeNode',                 test: type.isRangeNode },
    { name: 'Node',                      test: type.isNode }
  ]

  typed.conversions = [
    {
      from: 'number',
      to: 'BigNumber',
      convert: x => {
        // note: conversion from number to BigNumber can fail if x has >15 digits
        if (digits(x) > 15) {
          throw new TypeError(`Cannot implicitly convert a number with >15 significant digits to BigNumber (value: ${x}). Use function bignumber(x) to convert to BigNumber.`)
        }
        return new type.BigNumber(x);
      }
    }, {
      from: 'number',
      to: 'Complex',
      convert: x => new type.Complex(x, 0)
    }, {
      from: 'number',
      to: 'string',
      convert: x => x + ''
    }, {
      from: 'BigNumber',
      to: 'Complex',
      convert: x => new type.Complex(x.toNumber(), 0)
    }, {
      from: 'Fraction',
      to: 'BigNumber',
      convert: x => {
        throw new TypeError('Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.')
      }
    }, {
      from: 'Fraction',
      to: 'Complex',
      convert: x => new type.Complex(x.valueOf(), 0)
    }, {
      from: 'number',
      to: 'Fraction',
      convert: x => {
        const f = new type.Fraction(x)
        if(f.valueOf() !== x) {
          throw new TypeError(`Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: ${x}). Use function fraction(x) to convert to Fraction.`)
        }
        return new type.Fraction(x)
      }
    }, {
      from: 'string',
      to: 'number',
      convert: x => {
        const n = Number(x)
        if(isNaN(n)) {
          throw new Error(`Cannot convert "${x}" to a number`)
        }
        return n
      }
    }, {
      from: 'string',
      to: 'BigNumber',
      convert: x => {
        try {
          return new type.BigNumber(x)
        }
        catch (err) {
          throw new Error(`Cannot convert "${x}" to BigNumber`)
        }
      }
    }, {
      from: 'string',
      to: 'Fraction',
      convert: x => {
        try {
          return new type.Fraction(x)
        }
        catch (err) {
          throw new Error(`Cannot convert "${x}" to Fraction`)
        }
      }
    }, {
      from: 'string',
      to: 'Complex',
      convert: x => {
        try {
          return new type.Complex(x)
        }
        catch(err) {
          throw new Error(`Cannot convert "${x}" to Complex`)
        }
      }
    }, {
      from: 'boolean',
      to: 'number',
      convert: x => +x
    }, {
      from: 'boolean',
      to: 'BigNumber',
      convert: x => new type.BigNumber(+x)
    }, {
      from: 'boolean',
      to: 'Fraction',
      convert: x => new type.Fraction(+x)
    }, {
      from: 'boolean',
      to: 'string',
      convert: x => +x
    }, {
      from: 'null',
      to: 'number',
      convert: () => 0
    }, {
      from: 'null',
      to: 'string',
      convert: () => 'null'
    }, {
      from: 'null',
      to: 'BigNumber',
      convert: () => new type.BigNumber(0)
    }, {
      from: 'null',
      to: 'Fraction',
      convert: () => new type.Fraction(0)
    }, {
      from: 'Array',
      to: 'Matrix',
      convert: array => new type.DenseMatrix(array)
    }, {
      from: 'Matrix',
      to: 'Array',
      convert: matrix => matrix.valueOf()
    }
  ]

  /**
  * Determine the type of a variable
  *
  *     typed.find(x)
  *
  * The following types are recognized:
  *
  *     'undefined'
  *     'null'
  *     'boolean'
  *     'number'
  *     'string'
  *     'Array'
  *     'Function'
  *     'Date'
  *     'RegExp'
  *     'Object'
  *
  * @param {*} x
  * @return {string} Returns the name of the type. Primitive types are lower case,
  *                  non-primitive types are upper-camel-case.
  *                  For example 'number', 'string', 'Array', 'Date'.
  */
  typed.find = x => {
    let type = typeof x

    if(type === 'object') {
      switch (true) {
        case x === null:
        return 'null'
        case Array.isArray(x):
        return 'Array'
        case x instanceof Date:
        return 'Date'
        case x instanceof RegExp:
        return 'RegExp'
        case x instanceof Boolean:
        return 'boolean'
        case x instanceof Number:
        return 'number'
        case x instanceof String:
        return 'string'
        default:
        return 'Object'
      }
    } else if(type === 'function') {
      type = 'Function'
    }

    return type
  }

  return typed
}

const typed = create(type)
export { typed, type }
