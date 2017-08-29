import Node from './Node'
import compile, { register } from '../../helpers/compile'
import { type } from '../../helpers/types'
import access from '../../helpers/access'
import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'

const { getSafeProperty } = objFunctions
const { stringify } = strFunctions

/**
 * @constructor AccessorNode
 * @extends {Node}
 * Access an object property or get a matrix subset
 *
 * @param {Node} object                 The object from which to retrieve
 *                                      a property or subset.
 * @param {IndexNode} index             IndexNode containing ranges
 */
function AccessorNode(object, index) {
  if(!(this instanceof AccessorNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  if(!type.isNode(object)) {
    throw new TypeError('Node expected for parameter "object"')
  }
  if(!type.isIndexNode(index)) {
    throw new TypeError('IndexNode expected for parameter "index"')
  }

  this.object = object || null
  this.index = index

  // readonly property name
  Object.defineProperty(this, 'name', {
    get: () => {
      if(this.index) {
        return (this.index.isObjectProperty()) ?
            this.index.getObjectProperty()
            : ''
      } else {
        return this.object.name || ''
      }
    },
    set: () => {
      throw new Error('Cannot assign a new name, name is read-only')
    }
  })
}

// Set type information

AccessorNode.prototype = new Node()

AccessorNode.prototype.type = 'AccessorNode'

AccessorNode.prototype.isAccessorNode = true

/**
 * Compile the node to javascript code
 * @param {AccessorNode} node  Node to be compiled
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
const compileAccessorNode = (node, defs, args) => {
  if(!(node instanceof AccessorNode)) {
    throw new TypeError('No valid AccessorNode')
  }

  defs.access = access
  defs.getSafeProperty = getSafeProperty

  const object = compile(node.object, defs, args)
  const index = compile(node.index, defs, args)

  if(node.index.isObjectProperty()) {
    const jsProp = stringify(node.index.getObjectProperty())
    return `getSafeProperty(${object}, ${jsProp})`
  } else if(node.index.needsSize()) {
    // if some parameters use the 'end' parameter, we need to calculate the size
    return `(function () {
          const object = ${object}
          var size = math.size(object).valueOf()
          return access(object, ${index})
        })()`
  }
  else {
    return `access(${object}, ${index})`
  }
}

// register the compile function
register(AccessorNode.prototype.type, compileAccessorNode);

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
AccessorNode.prototype.forEach = function(callback) {
  callback(this.object, 'object', this)
  callback(this.index, 'index', this)
}

/**
 * Create a new AccessorNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {AccessorNode} Returns a transformed copy of the node
 */
AccessorNode.prototype.map = function(callback) {
  return new AccessorNode(
      this._ifNode(callback(this.object, 'object', this)),
      this._ifNode(callback(this.index, 'index', this))
  );
};

/**
 * Create a clone of this node, a shallow copy
 * @return {AccessorNode}
 */
AccessorNode.prototype.clone = function() {
  return new AccessorNode(this.object, this.index)
}

/**
 * Get string representation
 * @param {Object} options
 * @return {string}
 */
AccessorNode.prototype._toString = function(options) {
  var object = this.object.toString(options)
  if (needParenthesis(this.object)) {
    object = `(${object})`
  }

  return object + this.index.toString(options)
};

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string}
 */
AccessorNode.prototype.toHTML = function(options) {
  let object = this.object.toHTML(options)
  if(needParenthesis(this.object)) {
    object = `<span class="math-parenthesis math-round-parenthesis">(</span>${object}<span class="math-parenthesis math-round-parenthesis">)</span>`
  }

  return object + this.index.toHTML(options)
}

/**
 * Get LaTeX representation
 * @param {Object} options
 * @return {string}
 */
AccessorNode.prototype._toTex = function(options) {
  let object = this.object.toTex(options)
  if(needParenthesis(this.object)) {
    object = `\\left(${object}\\right)`
  }

  return object + this.index.toTex(options)
}

/**
 * Are parenthesis needed?
 * @private
 */
const needParenthesis = node => !(
      type.isAccessorNode(node) ||
      type.isArrayNode(node) ||
      type.isConstantNode(node) ||
      type.isFunctionNode(node) ||
      type.isObjectNode(node) ||
      type.isParenthesisNode(node) ||
      type.isSymbolNode(node))

export default AccessorNode
