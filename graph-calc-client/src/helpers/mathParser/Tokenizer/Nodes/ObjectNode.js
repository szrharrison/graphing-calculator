import Node from './Node'
import compile, { register } from '../../helpers/compile'
import { type } from '../../helpers/types'

import strFunctions from '../../helpers/mathTypes/String/functions/string'
import objFunctions from '../../helpers/mathTypes/Object/functions/object'

const { isSafeProperty } = objFunctions
const { stringify, escape } = strFunctions

/**
 * @constructor ObjectNode
 * @extends {Node}
 * Holds an object with keys/values
 * @param {Object.<string, Node>} [properties]   array with key/value pairs
 */
function ObjectNode(properties) {
  if(!(this instanceof ObjectNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  this.properties = properties ? properties : {}

  // validate input
  if(properties &&
     (
       !(typeof properties === 'object') ||
       !Object.keys(properties).every( key => type.isNode(properties[key]) )
     )
    ) {
    throw new TypeError('Object containing Nodes expected')
  }
}

ObjectNode.prototype = new Node()

ObjectNode.prototype.type = 'ObjectNode'

ObjectNode.prototype.isObjectNode = true

/**
 * Compile the node to javascript code
 * @param {ObjectNode} node The node to be compiled
 * @param {Object} defs     Object which can be used to define functions
 *                          or constants globally available for the compiled
 *                          expression
 * @param {Object} args     Object with local function arguments, the key is
 *                          the name of the argument, and the value is `true`.
 *                          The object may not be mutated, but must be
 *                          extended instead.
 * @return {string} code
 * @private
 */
const compileObjectNode = (node, defs, args) => {
  if(!(node instanceof ObjectNode)) {
    throw new TypeError('No valid ObjectNode')
  }

  const entries = []
  for(let key in node.properties) {
    if(node.properties.hasOwnProperty(key)) {
      if(!isSafeProperty(node.properties, key)) {
        throw new Error(`No access to property "${key}"`)
      }

      entries.push(`${stringify(key)}: ${compile(node.properties[key], defs, args)}`)
    }
  }
  return `{${entries.join(', ')}}`
}

// register the compile function
register(ObjectNode.prototype.type, compileObjectNode)

/**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
ObjectNode.prototype.forEach = function(callback) {
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      callback(this.properties[key], `properties[${stringify(key)}]`, this)
    }
  }
}

/**
 * Create a new ObjectNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {ObjectNode} Returns a transformed copy of the node
 */
ObjectNode.prototype.map = function(callback) {
  const properties = {}
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      properties[key] = this._ifNode(callback(
          this.properties[key],
          `properties[${stringify(key)}]`,
          this
        ))
    }
  }
  return new ObjectNode(properties)
}

/**
 * Create a clone of this node, a shallow copy
 * @return {ObjectNode}
 */
ObjectNode.prototype.clone =function() {
  const properties = {}
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      properties[key] = this.properties[key]
    }
  }
  return new ObjectNode(properties)
}

/**
 * Get string representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
ObjectNode.prototype._toString = function(options) {
  const entries = []
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      entries.push(`${stringify(key)}: ${this.properties[key].toString(options)}`)
    }
  }
  return `{${entries.join(', ')}}`
}

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
ObjectNode.prototype.toHTML = function(options) {
  const entries = [];
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      entries.push(
        `<span class="math-symbol math-property">${escape(key)}</span><span class="math-operator math-assignment-operator math-property-assignment-operator math-binary-operator">:</span>${this.properties[key].toHTML(options)}`
      )
    }
  }
  return `<span class="math-parenthesis math-curly-parenthesis">{</span>${entries.join('<span class="math-separator">,</span>')}<span class="math-parenthesis math-curly-parenthesis">}</span>`
};

/**
 * Get LaTeX representation
 * @param {Object} options
 * @return {string} str
 */
ObjectNode.prototype._toTex = function(options) {
  const entries = []
  for(let key in this.properties) {
    if(this.properties.hasOwnProperty(key)) {
      entries.push(`\\mathbf{${key}:} & ${this.properties[key].toTex(options)}\\\\`)
    }
  }
  return `\\left\\{\\begin{array}{ll}${entries.join('\n')}\\end{array}\\right\\}`
}

export default ObjectNode
