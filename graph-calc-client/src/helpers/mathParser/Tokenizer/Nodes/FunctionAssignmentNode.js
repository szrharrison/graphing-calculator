import Node from './Node'
import compile, { register } from '../../helpers/compile'
import { keywords } from '../../../constants'
import { type, typed } from '../../helpers/types'
import latex from '../../helpers/latex'
import operators from '../../helpers/operators'
import { getUniqueArgumentName } from './helpers'

import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'
import arrFunctions from '../../helpers/mathTypes/Array/functions/array'

const { join, map } = arrFunctions
const { setSafeProperty } = objFunctions
const { stringify, escape } = strFunctions


/**
 * @constructor FunctionAssignmentNode
 * @extends {Node}
 * Function assignment
 *
 * @param {string} name           Function name
 * @param {string[] | Array.<{name: string, type: string}>} params
 *                                Array with function parameter names, or an
 *                                array with objects containing the name
 *                                and type of the parameter
 * @param {Node} expr             The function expression
 */
function FunctionAssignmentNode(name, params, expr) {
  if(!(this instanceof FunctionAssignmentNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  // validate input
  if(typeof name !== 'string') {
    throw new TypeError('String expected for parameter "name"')
  }
  if(!Array.isArray(params)) {
    throw new TypeError('Array containing strings or objects expected for parameter "params"')
  }
  if(!type.isNode(expr)) {
    throw new TypeError('Node expected for parameter "expr"')
  }
  if(keywords.hasOwnProperty(name)) {
    throw new Error(`Illegal function name, "${name}" is a reserved keyword`)
  }

  this.name = name
  this.params = params.map( param => param ? param.name : param )
  this.types = params.map( param => param ? param.type : 'any' )
  this.expr = expr
}

FunctionAssignmentNode.prototype = new Node()

FunctionAssignmentNode.prototype.type = 'FunctionAssignmentNode'

FunctionAssignmentNode.prototype.isFunctionAssignmentNode = true

/**
 * Compile the node to javascript code
 * @param {FunctionAssignmentNode} node The node to be compiled
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
const compileFunctionAssignmentNode = (node, defs, args) => {
  if(!(node instanceof FunctionAssignmentNode)) {
    throw new TypeError('No valid FunctionAssignmentNode')
  }

  defs.typed = typed
  defs.setSafeProperty = setSafeProperty

  // validate params
  // FIXME: rename parameters to safe, internal names

  // we extend the original args and add the args to the child object
  // and create a mapping from the unsafe param name to a safe, internal one
  const childArgs = Object.create(args)
  const jsParams = map(
    node.params,
    param => {
      childArgs[param] = getUniqueArgumentName(childArgs)
      return childArgs[param]
    }
  )

  // compile the function expression with the child args
  const jsExpr = compile(node.expr, defs, childArgs)
  const jsName = stringify(node.name)

  return `setSafeProperty(scope, ${jsName},
        (function () {
          const fn = typed(${jsName}, {
            ${stringify(join(node.types, ','))}: function (${join(jsParams, ',')}) {
              return ${jsExpr}
            }
          })
          fn.syntax = ${stringify(`${node.name}(${join(node.params, ', ')})`)}
          return fn
        })())`
}

// register the compile function
register(FunctionAssignmentNode.prototype.type, compileFunctionAssignmentNode)

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
FunctionAssignmentNode.prototype.forEach = function(callback) {
  callback(this.expr, 'expr', this)
}

/**
 * Create a new FunctionAssignmentNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {FunctionAssignmentNode} Returns a transformed copy of the node
 */
FunctionAssignmentNode.prototype.map = function(callback) {
  const expr = this._ifNode(callback(this.expr, 'expr', this))

  return new FunctionAssignmentNode(this.name, this.params.slice(0), expr)
}

/**
 * Create a clone of this node, a shallow copy
 * @return {FunctionAssignmentNode}
 */
FunctionAssignmentNode.prototype.clone = function() {
  return new FunctionAssignmentNode(this.name, this.params.slice(0), this.expr)
}

/**
 * Is parenthesis needed?
 * @param {Node} node
 * @param {Object} parenthesis
 * @private
 */
const needParenthesis = (node, parenthesis) => {
  const precedence = operators.getPrecedence(node, parenthesis)
  const exprPrecedence = operators.getPrecedence(node.expr, parenthesis)

  return ((parenthesis === 'all') ||
          (
            (exprPrecedence !== null) &&
            (exprPrecedence <= precedence)
         ))
}

/**
 * get string representation
 * @param {Object} options
 * @return {string} str
 */
FunctionAssignmentNode.prototype._toString = function(options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'
  let expr = this.expr.toString(options)
  if(needParenthesis(this, parenthesis)) {
    expr = `(${expr})`
  }
  return `${this.name}(${this.params.join(', ')}) = ${expr}`
}

/**
 * get HTML representation
 * @param {Object} options
 * @return {string} str
 */
 FunctionAssignmentNode.prototype.toHTML = function (options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'
  const params = []

  for(let i = 0; i < this.params.length; i++)	{
    params.push(`<span class="math-symbol math-parameter">${escape(this.params[i])}</span>`)
  }

  let expr = this.expr.toHTML(options)
  if(needParenthesis(this, parenthesis)) {
    expr = `<span class="math-parenthesis math-round-parenthesis">(</span>${expr}<span class="math-parenthesis math-round-parenthesis">)</span>`
  }
  return `<span class="math-function">${escape(this.name)}</span>
    <span class="math-parenthesis math-round-parenthesis">(</span>
      ${params.join('<span class="math-separator">,</span>')}
    <span class="math-parenthesis math-round-parenthesis">)</span>
    <span class="math-operator math-assignment-operator math-variable-assignment-operator math-binary-operator">=</span>
    ${expr}`
}

/**
 * get LaTeX representation
 * @param {Object} options
 * @return {string} str
 */
FunctionAssignmentNode.prototype._toTex = function(options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'
  let expr = this.expr.toTex(options)
  if(needParenthesis(this, parenthesis)) {
    expr = `\\left(${expr}\\right)`
  }

  return `\\mathrm{${this.name}}\\left(${this.params.map(latex.toSymbol).join(',')}\\right):=${expr}`
}

export default FunctionAssignmentNode
