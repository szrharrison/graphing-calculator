import { type } from '../../helpers/types'
import strFunctions from '../../helpers/mathTypes/String/functions/string'
import compile, { register } from '../../helpers/compile'
import Node from './Node'
import RangeNode from './RangeNode'
import SymbolNode from './SymbolNode'
import Range from '../../helpers/mathTypes/Matrix/Range'
import arrFunctions from '../../helpers/mathTypes/Array/functions/array'

const { join } = arrFunctions
const { escape } = strFunctions



/**
 * @constructor IndexNode
 * @extends Node
 *
 * Describes a subset of a matrix or an object property.
 * Cannot be used on its own, needs to be used within an AccessorNode or
 * AssignmentNode.
 *
 * @param {Node[]} dimensions
 * @param {boolean} [dotNotation=false]  Optional property describing whether
 *                                       this index was written using dot
 *                                       notation like `a.b`, or using bracket
 *                                       notation like `a["b"]` (default).
 *                                       Used to stringify an IndexNode.
 */
function IndexNode([dimensions, dotNotation]) {
  if(!(this instanceof IndexNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  this.dimensions = dimensions
  this.dotNotation = dotNotation || false

  // validate input
  if(!Array.isArray(dimensions) || !dimensions.every(type.isNode)) {
    throw new TypeError('Array containing Nodes expected for parameter "dimensions"')
  }
  if(this.dotNotation && !this.isObjectProperty()) {
    throw new Error('dotNotation only applicable for object properties')
  }
}

IndexNode.prototype = new Node()

IndexNode.prototype.type = 'IndexNode'

IndexNode.prototype.isIndexNode = true

/**
 * Compile all range nodes
 *
 * When some of the dimensions has `end` defined, the IndexNode requires
 * a variable `size` to be defined in the current closure, and must contain
 * the size of the matrix that's being handled. To check whether the `size`
 * variable is needed, call IndexNode.needsSize().
 *
 * @param {IndexNode} node        The node to be compiled
 * @param {Object} defs           Object which can be used to define functions
 *                                or constants globally available for the
 *                                compiled expression
 * @param {Object} args           Object with local function arguments, the key is
 *                                the name of the argument, and the value is `true`.
 *                                The object may not be mutated, but must be
 *                                extended instead.
 * @return {string} code
 */
const compileIndexNode = (node, defs, args) => {
  if(!(node instanceof IndexNode)) {
    throw new TypeError('No valid IndexNode')
  }

  // args can be mutated by IndexNode, when dimensions use `end`
  var childArgs = Object.create(args)

  // helper function to create a Range from start, step and end
  defs.range = (start, end, step) => new Range(
        type.isBigNumber(start) ? start.toNumber() : start,
        type.isBigNumber(end)   ? end.toNumber()   : end,
        type.isBigNumber(step)  ? step.toNumber()  : step
    )

  // optimization for a simple object property
  const dimensions = node.dimensions.map((range, i) => {
    if(type.isRangeNode(range)) {
      if(range.needsEnd()) {
        childArgs.end = 'end'

        // resolve end and create range
        return `(function () {
            var end = size[${i}]
            return range(
            ${compile(range.start, defs, childArgs)},
            ${compile(range.end, defs, childArgs)},
            ${(range.step ? compile(range.step, defs, childArgs) : '1')}
            )
            })()`
      } else {
        // create range
        return `range(
            ${compile(range.start, defs, childArgs)},
            ${compile(range.end, defs, childArgs)},
            ${(range.step ? compile(range.step, defs, childArgs) : '1')}
            )`
      }
    }

    if(type.isSymbolNode(range) && range.name === 'end') {
      childArgs.end = 'end'

      // resolve the parameter 'end'
      return `(function () {
          var end = size[${i}']
          return ${compile(range, defs, childArgs)}
          })()`
    } else { // ConstantNode
      return compile(range, defs, childArgs)
    }
  })

  return `math.index(${join(dimensions, ', ')})`
}

// register the compile function
register(IndexNode.prototype.type, compileIndexNode)

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
IndexNode.prototype.forEach = function(callback) {
  for(let i = 0; i < this.dimensions.length; i++) {
    callback(this.dimensions[i], `dimensions[${i}]`, this)
  }
}

/**
 * Create a new IndexNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {IndexNode} Returns a transformed copy of the node
 */
IndexNode.prototype.map = function(callback) {
  const dimensions = []
  for(let i = 0; i < this.dimensions.length; i++) {
    dimensions[i] = this._ifNode(callback(this.dimensions[i], `dimensions[${i}]`, this))
  }

  return new IndexNode(dimensions)
}

/**
 * Create a clone of this node, a shallow copy
 * @return {IndexNode}
 */
IndexNode.prototype.clone = function() {
  return new IndexNode(this.dimensions.slice(0))
}

/**
 * Test whether this IndexNode contains a single property name
 * @return {boolean}
 */
IndexNode.prototype.isObjectProperty = function() {
  return this.dimensions.length === 1 &&
      type.isConstantNode(this.dimensions[0]) &&
      this.dimensions[0].valueType === 'string'
}

/**
 * Returns the property name if IndexNode contains a property.
 * If not, returns null.
 * @return {string | null}
 */
IndexNode.prototype.getObjectProperty = function() {
  return this.isObjectProperty() ? this.dimensions[0].value : null
}

/**
 * Get string representation
 * @param {Object} options
 * @return {string} str
 */
IndexNode.prototype._toString = function(options) {
  // format the parameters like "[1, 0:5]"
  return this.dotNotation
      ? ('.' + this.getObjectProperty())
      : ('[' + this.dimensions.join(', ') + ']')
}

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string} str
 */
IndexNode.prototype.toHTML = function(options) {
  // format the parameters like "[1, 0:5]"
  const dimensions = []
  for(let i = 0; i < this.dimensions.length; i++) {
    dimensions[i] = this.dimensions[i].toHTML()
  }

  if(this.dotNotation) {
    return `<span class="math-operator math-accessor-operator">.</span><span class="math-symbol math-property">${escape(this.getObjectProperty())}</span>`
  } else {
    return `<span class="math-parenthesis math-square-parenthesis">[</span> ${dimensions.join('<span class="math-separator">,</span>')}<span class="math-parenthesis math-square-parenthesis">]</span>`
  }
}

/**
 * Get LaTeX representation
 * @param {Object} options
 * @return {string} str
 */
IndexNode.prototype._toTex = function(options) {
  const dimensions = this.dimensions.map( range => range.toTex(options) )

  return this.dotNotation
      ? ('.' + this.getObjectProperty() + '')
      : ('_{' + dimensions.join(',') + '}')
}

/**
 * Test whether this IndexNode needs the object size, size of the Matrix
 * @return {boolean}
 */
IndexNode.prototype.needsSize = function() {
  return this.dimensions.some(range => (
      (type.isRangeNode(range) && range.needsEnd()) ||
      (type.isSymbolNode(range) && range.name === 'end')
    ))
}

export default IndexNode
