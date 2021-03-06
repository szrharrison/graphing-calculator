import Node from './Node'
import SymbolNode from './SymbolNode'
import compile, { register } from '../../helpers/compile'
import { type } from '../../helpers/types'
import { getUniqueArgumentName } from './helpers'

import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'
import arrFunctions from '../../helpers/mathTypes/Array/functions/array'

const { join, map } = arrFunctions
const { validateSafeMethod, extend } = objFunctions
const { stringify, escape } = strFunctions

// var extend = require('../../utils/object').extend

/**
 * @constructor FunctionNode
 * @extends {./Node}
 * invoke a list with arguments on a node
 * @param {./Node | string} fn Node resolving with a function on which to invoke
 *                             the arguments, typically a SymboNode or AccessorNode
 * @param {./Node[]} args
 */
function FunctionNode(fn, args) {
  if(!(this instanceof FunctionNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  if(typeof fn === 'string') {
    fn = new SymbolNode(fn)
  }

  // validate input
  if(!type.isNode(fn)) {
    throw new TypeError('Node expected as parameter "fn"')
  }
  if(!Array.isArray(args) || !args.every(type.isNode)) {
    throw new TypeError('Array containing Nodes expected for parameter "args"')
  }

  this.fn = fn
  this.args = args ? args : []

  // readonly property name
  Object.defineProperty(this, 'name', {
    get: () => this.fn.name ? this.fn.name : '',
    set: () => {
      throw new Error('Cannot assign a new name, name is read-only')
    }
  })
}

FunctionNode.prototype = new Node()

FunctionNode.prototype.type = 'FunctionNode'

FunctionNode.prototype.isFunctionNode = true

/**
 * Compile the node to javascript code
 * @param {FunctionNode} node The node to be compiled
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
const compileFunctionNode = (node, defs, args) => {
  if(!(node instanceof FunctionNode)) {
    throw new TypeError('No valid FunctionNode')
  }

  // compile fn and arguments
  const jsFn = compile(node.fn, defs, args)
  const jsArgs = map(
    node.args,
    arg => compile(arg, defs, args)
  )
  const jsScope = compileScope(defs, args)
  let argsName

  if(type.isSymbolNode(node.fn)) {
    // we can statically determine whether the function has a rawArgs property
    const name = node.fn.name
    const fn = defs.math.hasOwnProperty(name) ? defs.math[name] : undefined
    const isRaw = (typeof fn === 'function') && (fn.rawArgs === true)

    if(isRaw) {
      // pass unevaluated parameters (nodes) to the function
      argsName = getUniqueArgumentName(defs)
      defs[argsName] = node.args

      return `${jsFn}(${argsName}, math, ${jsScope})` // "raw" evaluation
    } else {
      return `${jsFn}(${join(jsArgs, ', ')})`         // "regular" evaluation
    }
  } else if(type.isAccessorNode(node.fn) &&
            type.isIndexNode(node.fn.index) &&
            node.fn.index.isObjectProperty()) {
    // execute the function with the right context: the object of the AccessorNode
    argsName = getUniqueArgumentName(defs)
    defs[argsName] = node.args
    defs.validateSafeMethod = validateSafeMethod

    const jsObject = compile(node.fn.object, defs, args)
    const jsProp = stringify(node.fn.index.getObjectProperty())

    return `(function () {
        const object = ${jsObject}
        validateSafeMethod(object, ${jsProp})
        return (object[${jsProp}] && object[${jsProp}].rawArgs) ?
               object[${jsProp}](${argsName}, math, ${jsScope}) // "raw" evaluation
               : object[${jsProp}](${join(jsArgs, ', ')})       // "regular" evaluation
        })()`
  } else { // node.fn.isAccessorNode && !node.fn.index.isObjectProperty()
    // we have to dynamically determine whether the function has a rawArgs property
    argsName = getUniqueArgumentName(defs)
    defs[argsName] = node.args

    return `(function () {
        const fn = ${jsFn}
        return (fn && fn.rawArgs) ?
                fn(${argsName}, math, ${jsScope})  // "raw" evaluation
                : fn(${join(jsArgs, ', ')})        // "regular" evaluation
        })()`
  }
}

// register the compile function
register(FunctionNode.prototype.type, compileFunctionNode)

/**
 * Merge function arguments into scope before passing to the actual function.
 * This is needed when the function has `rawArgs=true`. In that case we have
 * to pass the `scope` as third argument, including any variables of
 * enclosing functions.
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
const compileScope = (defs, args) => {
  const names = Object.keys(args)
      // .map(function (arg) {
      //   return args[arg];
      // });
  if(names.length === 0) {
    return 'scope'
  } else {
    // merge arguments into scope
    defs.extend = extend

    const jsArgs = map(
      names,
      name => `${stringify(name)}: ${args[name]}`
    )

    return `extend(extend({}, scope), {${join(jsArgs, ', ')}})`
  }
}

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
FunctionNode.prototype.forEach = function(callback) {
  for(let i = 0; i < this.args.length; i++) {
    callback(this.args[i], `args[${i}]`, this)
  }
}

/**
 * Create a new FunctionNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {FunctionNode} Returns a transformed copy of the node
 */
FunctionNode.prototype.map = function(callback) {
  const fn = this.fn.map(callback)
  const args = []

  for(let i = 0; i < this.args.length; i++) {
    args[i] = this._ifNode(callback(this.args[i], `args[${i}]`, this))
  }

  return new FunctionNode(fn, args)
}

/**
 * Create a clone of this node, a shallow copy
 * @return {FunctionNode}
 */
FunctionNode.prototype.clone = function() {
  return new FunctionNode(this.fn, this.args.slice(0))
}

/**
 * backup Node's toString function
 * @private
 */
const nodeToString = FunctionNode.prototype.toString

/**
 * Get string representation. (wrapper function)
 * This overrides parts of Node's toString function.
 * If callback is an object containing callbacks, it
 * calls the correct callback for the current node,
 * otherwise it falls back to calling Node's toString
 * function.
 *
 * @param {Object} options
 * @return {string}
 * @override
 */
FunctionNode.prototype.toString = function(options) {
  let customString
  const name = this.fn.toString(options)
  if(options &&
     (typeof options.handler === 'object') &&
     options.handler.hasOwnProperty(name)) {
    //callback is a map of callback functions
    customString = options.handler[name](this, options)
  }

  if(typeof customString !== 'undefined') {
    return customString
  }

  //fall back to Node's toString
  return nodeToString.call(this, options)
}

/**
 * Get string representation
 * @param {Object} options
 * @return {string} str
 */
FunctionNode.prototype._toString = function(options) {
  const args = this.args.map( arg => arg.toString(options) )

  const fn = type.isFunctionAssignmentNode(this.fn) ?
      (`(${this.fn.toString(options)})`)
      : this.fn.toString(options)

  // format the arguments like "add(2, 4.2)"
  return `${fn}(${args.join(', ')})`
};

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string} str
 */
FunctionNode.prototype.toHTML = function(options) {
  const args = this.args.map( arg => arg.toHTML(options) )

  // format the arguments like "add(2, 4.2)"
  return `<span class="math-function">${escape(this.fn)}</span><span class="math-paranthesis math-round-parenthesis">(</span>${args.join('<span class="math-separator">,</span>')}<span class="math-paranthesis math-round-parenthesis">)</span>`
}

/**
 * Expand a LaTeX template
 *
 * @param {string} template
 * @param {Node} node
 * @param {Object} options
 * @private
 */
const expandTemplate = (template, node, options) => {
  let laTeX = ''

  // Match everything of the form ${identifier} or ${identifier[2]} or $$
  // while submatching identifier and 2 (in the second case)
  const regex = new RegExp('\\$(?:\\{([a-z_][a-z_0-9]*)(?:\\[([0-9]+)\\])?\\}|\\$)', 'ig')

  let inputPos = 0,   //position in the input string
      match

  // Unsure how to replicate this behavior without having the assignment in the conditional check
  // eslint-disable-next-line
  while((match = regex.exec(template)) !== null) {   //go through all matches
    // add everything in front of the match to the LaTeX string
    laTeX += template.substring(inputPos, match.index)
    inputPos = match.index

    if(match[0] === '$$') { // escaped dollar sign
      laTeX += '$'
      inputPos++
    } else { // template parameter
      inputPos += match[0].length
      const property = node[match[1]]
      if(!property) {
        throw new ReferenceError(`Template: Property ${match[1]} does not exist.`)
      }
      if(match[2] === undefined) { //no square brackets
        switch(typeof property) {
          case 'string':
            laTeX += property
            break
          case 'object':
            if(type.isNode(property)) {
              laTeX += property.toTex(options)
            } else if(Array.isArray(property)) {
              //make array of Nodes into comma separated list
              //disable linting on next line, arrow function definition is for map function, not for while loop...
              laTeX += property.map( (arg, index) => {      // eslint-disable-line
                if(type.isNode(arg)) {
                  return arg.toTex(options)
                }
                throw new TypeError(`Template: ${match[1]}[${index}] is not a Node.`)
              }).join(',')
            } else {
              throw new TypeError(`Template: ${match[1]} has to be a Node, String or array of Nodes`)
            }
            break
          default:
            throw new TypeError(`Template: ${match[1]} has to be a Node, String or Array of Nodes`)
        }
      } else { //with square brackets
        if(type.isNode(property[match[2]])) {
          laTeX += property[match[2]].toTex(options)
        } else {
          throw new TypeError(`Template: ${match[1]}[${match[2]}] is not a Node.`)
        }
      }
    }
  }
  laTeX += template.slice(inputPos)  //append rest of the template

  return laTeX
}

/**
 * backup Node's toTex function
 * @private
 */
const nodeToTex = FunctionNode.prototype.toTex

/**
 * Get LaTeX representation. (wrapper function)
 * This overrides parts of Node's toTex function.
 * If callback is an object containing callbacks, it
 * calls the correct callback for the current node,
 * otherwise it falls back to calling Node's toTex
 * function.
 *
 * @param {Object} options
 * @return {string}
 */
FunctionNode.prototype.toTex = function(options) {
  let customTex
  if(options &&
     (typeof options.handler === 'object') &&
     options.handler.hasOwnProperty(this.name)) {
    //callback is a map of callback functions
    customTex = options.handler[this.name](this, options)
  }

  if(typeof customTex !== 'undefined') {
    return customTex
  }

  //fall back to Node's toTex
  return nodeToTex.call(this, options)
}

// /**
//  * Get LaTeX representation
//  * @param {Object} options
//  * @return {string} str
//  */
// FunctionNode.prototype._toTex = function(options) {
//   const args = this.args.map(arg => arg.toTex(options) )  //get LaTeX of the arguments
//
//   let latexConverter
//
//   if(math[this.name] &&
//      (
//        (typeof math[this.name].toTex === 'function') ||
//        (typeof math[this.name].toTex === 'object') ||
//        (typeof math[this.name].toTex === 'string')
//      )) {
//     //.toTex is a callback function
//     latexConverter = math[this.name].toTex
//   }
//
//   let customToTex
//   if(typeof latexConverter === 'function') { //a callback function
//     customToTex = latexConverter(this, options)
//   } else if(typeof latexConverter ===  'string') { //a template string
//     customToTex = expandTemplate(latexConverter, this, options)
//   } else if(typeof latexConverter === 'object') { //an object with different "converters" for different numbers of arguments
//     if(typeof latexConverter[args.length] === 'function') {
//       customToTex = latexConverter[args.length](this, options)
//     } else if(typeof latexConverter[args.length] === 'string') {
//       customToTex = expandTemplate(latexConverter[args.length], this, options)
//     }
//   }
//
//   if(typeof customToTex !== 'undefined') {
//     return customToTex
//   }
//
//   return expandTemplate(latex.defaultTemplate, this, options)
// }

/**
 * Get identifier.
 * @return {string}
 */
FunctionNode.prototype.getIdentifier = function() {
  return `${this.type}:${this.name}`
}

export default FunctionNode
