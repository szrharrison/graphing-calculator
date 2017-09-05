import Node from './Node'
import compile, { register } from '../../helpers/compile'
import { type } from '../../helpers/types'
import operators from '../../helpers/operators'
import latex from '../../helpers/latex'
import { calculateNecessaryParentheses } from './helpers'

import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'
import arrFunctions from '../../helpers/mathTypes/Array/functions/array'

const { stringify, escape } = strFunctions
const { isSafeMethod } = objFunctions
const { join, map } = arrFunctions

/**
 * @constructor OperatorNode
 * @extends {Node}
 * An operator with two arguments, like 2+3
 *
 * @param {string} op           Operator name, for example '+'
 * @param {string} fn           Function name, for example 'add'
 * @param {Node[]} args         Operator arguments
 * @param {boolean} [implicit]  Is this an implicit multiplication?
 */
function OperatorNode(op, fn, args, implicit) {
  if(!(this instanceof OperatorNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  //validate input
  if(typeof op !== 'string') {
    throw new TypeError('string expected for parameter "op"')
  }
  if(typeof fn !== 'string') {
    throw new TypeError('string expected for parameter "fn"')
  }
  if(!Array.isArray(args) || !args.every(type.isNode)) {
    throw new TypeError('Array containing Nodes expected for parameter "args"')
  }

  this.implicit = (implicit === true)
  this.op = op
  this.fn = fn
  this.args = args ? args : []
}

OperatorNode.prototype = new Node()

OperatorNode.prototype.type = 'OperatorNode'

OperatorNode.prototype.isOperatorNode = true

/**
 * Compile the node to javascript code
 * @param {OperatorNode} node The node to be compiled
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
const compileOperatorNode = (node, defs, args) => {
  if(!(node instanceof OperatorNode)) {
    throw new TypeError('No valid OperatorNode')
  }

  // validate fn
  if(typeof node.fn !== 'string' || !isSafeMethod(defs.math, node.fn)) {
    if(!defs.math[node.fn]) {
      throw new Error(`Function ${node.fn} missing in provided namespace "math"`)
    } else {
      throw new Error(`No access to function "${node.fn}"`)
    }
  }

  const jsArgs = map(
    node.args,
    arg => compile(arg, defs, args)
  )

  return `math[${stringify(node.fn)}](${join(jsArgs, ', ')})`
}

// register the compile function
register(OperatorNode.prototype.type, compileOperatorNode)

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
OperatorNode.prototype.forEach = function(callback) {
  for(let i = 0; i < this.args.length; i++) {
    callback(this.args[i], `args[${i}]`, this)
  }
}

/**
 * Create a new OperatorNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {OperatorNode} Returns a transformed copy of the node
 */
OperatorNode.prototype.map = function(callback) {
  const args = []
  for(let i = 0; i < this.args.length; i++) {
    args[i] = this._ifNode(callback(this.args[i], `args[${i}]`, this))
  }
  return new OperatorNode(this.op, this.fn, args)
}

/**
 * Create a clone of this node, a shallow copy
 * @return {OperatorNode}
 */
OperatorNode.prototype.clone = function() {
  return new OperatorNode(this.op, this.fn, this.args.slice(0), this.implicit)
}

/**
 * Get string representation.
 * @param {Object} options
 * @return {string} str
 */
OperatorNode.prototype._toString = function(options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'
  const implicit = (options && options.implicit) ? options.implicit : 'hide'
  const args = this.args
  const parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, false)

  if(args.length === 1) { //unary operators
    const assoc = operators.getAssociativity(this, parenthesis)

    let operand = args[0].toString(options);
    if(parens[0]) {
      operand = `(${operand})`
    }

    if(assoc === 'right') { //prefix operator
      return this.op + operand
    } else if(assoc === 'left') { //postfix
      return operand + this.op
    }

    //fall back to postfix
    return operand + this.op
  } else if(args.length === 2) {
    let lhs = args[0].toString(options) //left hand side
    let rhs = args[1].toString(options) //right hand side
    if(parens[0]) { //left hand side in parenthesis?
      lhs = `(${lhs})`
    }
    if(parens[1]) { //right hand side in parenthesis?
      rhs = `(${rhs})`
    }

    if(
       this.implicit &&
       (this.getIdentifier() === 'OperatorNode:multiply') &&
       (implicit === 'hide')
     ) {
      return `${lhs} ${rhs}`
    }

    return `${lhs} ${this.op} ${rhs}`
  } else if(
    (args.length > 2) &&
    (
      (this.getIdentifier() === 'OperatorNode:add') ||
      (this.getIdentifier() === 'OperatorNode:multiply')
    )
  ) {
    const stringifiedArgs = args.map( (arg, index) => {
      arg = arg.toString(options)
      if(parens[index]) { //put in parenthesis?
        arg = `(${arg})`
      }

      return arg
    })

    if(
      this.implicit &&
      (this.getIdentifier() === 'OperatorNode:multiply') &&
      (implicit === 'hide')
    ) {
      return stringifiedArgs.join(' ')
    }

    return stringifiedArgs.join(` ${this.op} `)
  } else {
    //fallback to formatting as a function call
    return `${this.fn}(${this.args.join(', ')})`
  }
}

/**
 * Get HTML representation.
 * @param {Object} options
 * @return {string} str
 */
OperatorNode.prototype.toHTML = function (options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'
  const implicit = (options && options.implicit) ? options.implicit : 'hide'
  const args = this.args
  const parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, false)

  if(args.length === 1) { //unary operators
    const assoc = operators.getAssociativity(this, parenthesis)

    let operand = args[0].toHTML(options)
    if(parens[0]) {
      operand = `<span class="math-parenthesis math-round-parenthesis">(</span>${operand}<span class="math-parenthesis math-round-parenthesis">)</span>`
    }

    if(assoc === 'right') { //prefix operator
      return `<span class="math-operator math-unary-operator math-lefthand-unary-operator">${escape(this.op)}</span>${operand}`
    } else if(assoc === 'left') { //postfix
      return `<span class="math-operator math-unary-operator math-righthand-unary-operator">${escape(this.op)}</span>${operand}`
    }

    //fall back to postfix
    return `<span class="math-operator math-unary-operator math-righthand-unary-operator">${escape(this.op)}</span>${operand}`
  } else if(args.length === 2) { // binary operatoes
    let lhs = args[0].toHTML(options) //left hand side
    let rhs = args[1].toHTML(options) //right hand side
    if(parens[0]) { //left hand side in parenthesis?
      lhs = `<span class="math-parenthesis math-round-parenthesis">(</span>${lhs}<span class="math-parenthesis math-round-parenthesis">)</span>`
    }
    if(parens[1]) { //right hand side in parenthesis?
      rhs = `<span class="math-parenthesis math-round-parenthesis">(</span>${rhs}<span class="math-parenthesis math-round-parenthesis">)</span>`
    }

  if(
    this.implicit &&
    (this.getIdentifier() === 'OperatorNode:multiply') &&
    (implicit === 'hide')
  ) {
    return `${lhs}<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>${rhs}`
  }

  return `${lhs}<span class="math-operator math-binary-operator math-explicit-binary-operator">${escape(this.op)}</span>${rhs}`
  } else if(
    (args.length > 2) &&
    (
      (this.getIdentifier() === 'OperatorNode:add') ||
      (this.getIdentifier() === 'OperatorNode:multiply')
    )
  ) {
    const stringifiedArgs = args.map( (arg, index) => {
      arg = arg.toHTML(options)
      if(parens[index]) { //put in parenthesis?
        arg = `<span class="math-parenthesis math-round-parenthesis">(</span>${arg}<span class="math-parenthesis math-round-parenthesis">)</span>`
      }

      return arg
    })

    if(
      this.implicit &&
      (this.getIdentifier() === 'OperatorNode:multiply') &&
      (implicit === 'hide')
    ) {
      return stringifiedArgs.join('<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>')
    }

    return stringifiedArgs.join(`<span class="math-operator math-binary-operator math-explicit-binary-operator">${escape(this.op)}</span>`)
  } else {
    //fallback to formatting as a function call
    const stringifiedArgs = args.map( (arg, index) => {
      arg = arg.toHTML(options)
      if(parens[index]) { //put in parenthesis?
        arg = `<span class="math-parenthesis math-round-parenthesis">(</span>${arg}<span class="math-parenthesis math-round-parenthesis">)</span>`
      }

      return arg
    })
    return `<span class="math-function">${escape(this.fn)}</span><span class="math-paranthesis math-round-parenthesis">(</span>${stringifiedArgs.join('<span class="math-separator">,</span>')}<span class="math-paranthesis math-round-parenthesis">)</span>`
  }
};

/**
 * Get LaTeX representation
 * @param {Object} options
 * @return {string} str
 */
OperatorNode.prototype._toTex = function(options) {
  const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep';
  const implicit = (options && options.implicit) ? options.implicit : 'hide';
  const args = this.args;
  const parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, true);
  let op = latex.operators[this.fn]
  op = (typeof op === 'undefined') ? this.op : op; //fall back to using this.op

  if(args.length === 1) { //unary operators
    const assoc = operators.getAssociativity(this, parenthesis)

    let operand = args[0].toTex(options)
    if(parens[0]) {
      operand = `\\left(${operand}\\right)`
    }

    if(assoc === 'right') { //prefix operator
      return op + operand
    } else if(assoc === 'left') { //postfix operator
      return operand + op
    }

    //fall back to postfix
    return operand + op
  } else if(args.length === 2) { //binary operators
    const lhs = args[0]; //left hand side
    let lhsTex = lhs.toTex(options);

    if(parens[0]) {
      lhsTex = `\\left(${lhsTex}\\right)`
    }

    const rhs = args[1] //right hand side
    let rhsTex = rhs.toTex(options);

    if(parens[1]) {
      rhsTex = `\\left(${rhsTex}\\right)`
    }

    //handle some exceptions (due to the way LaTeX works)
    let lhsIdentifier

    if(parenthesis === 'keep') {
      lhsIdentifier = lhs.getIdentifier()
    } else {
      //Ignore ParenthesisNodes if in 'keep' mode
      lhsIdentifier = lhs.getContent().getIdentifier()
    }

    switch(this.getIdentifier()) {
      case 'OperatorNode:divide':
        //op contains '\\frac' at this point
        return `${op}{${lhsTex}}{${rhsTex}}`
      case 'OperatorNode:pow':
        lhsTex = `{${lhsTex}}`
        rhsTex = `{${rhsTex}}`
        switch (lhsIdentifier) {
          case 'ConditionalNode':
            // falls through
          case 'OperatorNode:divide':
            lhsTex = `\\left(${lhsTex}\\right)`
            break
          default:
        }
        // falls through
      case 'OperatorNode:multiply':
        if(
          this.implicit &&
          (implicit === 'hide')
        ) {
          return `${lhsTex}~${rhsTex}`
        }
        break
      default:
    }
    return lhsTex + op + rhsTex
  } else if(
    (args.length > 2) &&
    (
      (this.getIdentifier() === 'OperatorNode:add') ||
      (this.getIdentifier() === 'OperatorNode:multiply')
    )
  ) {
    const texifiedArgs = args.map( (arg, index) => {
      arg = arg.toTex(options)
      if(parens[index]) {
        arg = `\\left(${arg}\\right)`
      }
      return arg
    })

    if(
      (this.getIdentifier() === 'OperatorNode:multiply') &&
      this.implicit
    ) {
      return texifiedArgs.join('~')
    }

    return texifiedArgs.join(op)
  } else {
    //fall back to formatting as a function call
    //as this is a fallback, it doesn't use
    //fancy function names
    return `\\mathrm{${this.fn}}\\left(${args.map(
      arg => arg.toTex(options)
    ).join(',')}\\right)`
  }
}

/**
 * Get identifier.
 * @return {string}
 */
OperatorNode.prototype.getIdentifier = function() {
  return `${this.type}:${this.fn}`
}

export default OperatorNode
