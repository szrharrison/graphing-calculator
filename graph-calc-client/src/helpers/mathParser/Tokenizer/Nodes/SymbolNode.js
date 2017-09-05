import { register } from '../../helpers/compile'
import { type } from '../../helpers/types'
import Node from './Node'
import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'

// var latex = require('../../utils/latex')
// var math = require('../../math')

const { getSafeProperty } = objFunctions

/**
 * Check whether some name is a valueless unit like "inch".
 * @param {string} name
 * @return {boolean}
 */
const isValuelessUnit = name => (type.Unit ? type.Unit.isValuelessUnit(name) : false)

/**
 * @constructor SymbolNode
 * @extends {Node}
 * A symbol node can hold and resolve a symbol
 * @param {string} name
 * @extends {Node}
 */
function SymbolNode(name) {
  if(!(this instanceof SymbolNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  // validate input
  if(typeof name !== 'string') {
    throw new TypeError('String expected for parameter "name"')
  }

  this.name = name
}

SymbolNode.prototype = new Node()

SymbolNode.prototype.type = 'SymbolNode'

SymbolNode.prototype.isSymbolNode = true

/**
 * Compile the node to javascript code
 * @param {SymbolNode} node The node to be compiled
 * @param {Object} defs     Object which can be used to define functions
 *                          or constants globally available for the compiled
 *                          expression
 * @param {Object} args     Object with local function arguments, the key is
 *                          the name of the argument, and the value is `true`.
 *                          The object may not be mutated, but must be
 *                          extended instead.
 * @return {string} js
 * @private
 */
const compileSymbolNode = (node, defs, args) => {
  if(!(node instanceof SymbolNode)) {
    throw new TypeError('No valid SymbolNode')
  }

  // add a function to the definitions
  defs['undef'] = undef
  defs['Unit'] = type.Unit
  defs.getSafeProperty = getSafeProperty
  defs.hasOwnProperty = Object.prototype.hasOwnProperty

  const jsName = strFunctions.stringify(node.name) // escaped node name inside double quotes

  if(args.hasOwnProperty(node.name)) {
    // this is a FunctionAssignment argument
    // (like an x when inside the expression of a function assignment `f(x) = ...`)
    return args[node.name]
  } else if(node.name in defs.math) {
    return `(${jsName} in scope ?
        getSafeProperty(scope, ${jsName})
        : getSafeProperty(math, ${jsName}))`
  } else {
    return `(
        ${jsName} in scope ?
        getSafeProperty(scope, ${jsName})
        : ${(isValuelessUnit(node.name) ?
          `new Unit(null, ${jsName})`
          : `undef(${jsName})`)}
        )`
  }
}

// register the compile function
register(SymbolNode.prototype.type, compileSymbolNode)

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
SymbolNode.prototype.forEach = function(callback) {
  // nothing to do, we don't have childs
}

/**
 * Create a new SymbolNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node) : Node} callback
 * @returns {SymbolNode} Returns a clone of the node
 */
SymbolNode.prototype.map = function(callback) {
  return this.clone()
};

/**
 * Throws an error 'Undefined symbol {name}'
 * @param {string} name
 */
const undef = name => {throw new Error(`Undefined symbol ${name}`)}

/**
 * Create a clone of this node, a shallow copy
 * @return {SymbolNode}
 */
SymbolNode.prototype.clone = function() {
  return new SymbolNode(this.name)
}

/**
 * Get string representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
SymbolNode.prototype._toString = function(options) {
  return this.name
}

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
SymbolNode.prototype.toHTML = function(options) {
  const name = escape(this.name);

  if(name === "true" || name === "false") {
    return `<span class="math-symbol math-boolean">${name}</span>`
  } else if(name === "i") {
    return `<span class="math-symbol math-imaginary-symbol">${name}</span>`
  } else if(name === "Infinity") {
    return `<span class="math-symbol math-infinity-symbol">${name}</span>`
  } else if(name === "NaN") {
    return `<span class="math-symbol math-nan-symbol">${name}</span>`
  } else if(name === "null") {
    return `<span class="math-symbol math-null-symbol">${name}</span>`
  } else if(name === "uninitialized") {
    return `<span class="math-symbol math-uninitialized-symbol">${name}</span>`
  }

  return `<span class="math-symbol">${name}</span>'`
}

// /**
//  * Get LaTeX representation
//  * @param {Object} options
//  * @return {string} str
//  * @override
//  */
// SymbolNode.prototype._toTex = function(options) {
//   let isUnit = false
//
//   if((typeof math[this.name] === 'undefined') && isValuelessUnit(this.name)) {
//     isUnit = true
//   }
//
//   const symbol = latex.toSymbol(this.name, isUnit)
//
//   if(symbol[0] === '\\') {
//     //no space needed if the symbol starts with '\'
//     return symbol
//   }
//   //the space prevents symbols from breaking stuff like '\cdot' if it's written right before the symbol
//   return ` ${symbol}`
// }

export default SymbolNode
