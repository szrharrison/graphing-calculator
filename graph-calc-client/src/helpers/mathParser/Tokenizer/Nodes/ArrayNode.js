import Node from './Node'
import IndexNode from './IndexNode'
import compile, { register } from '../../compile'
// var access = load(require('./utils/access'));
// var stringify = require('../../utils/string').stringify;
// var getSafeProperty = require('../../utils/customs').getSafeProperty;

/**
 * @constructor ArrayNode
 * @extends {Node}
 * Access an object property or get a matrix subset
 *
 * @param {Node} object                 The object from which to retrieve
 *                                      a property or subset.
 * @param {IndexNode} index             IndexNode containing ranges
 */
const AccessorNode = ([object, index]) => {
  if(!(this instanceof AccessorNode)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if(!type.isNode(object)) {
    throw new TypeError('Node expected for parameter "object"');
  }
  if(!type.isIndexNode(index)) {
    throw new TypeError('IndexNode expected for parameter "index"');
  }

  this.object = object || null
  this.index = index

  // readonly property name
  let name

  if(this.index) {
    name = this.index.isObjectProperty()
        ? this.index.getObjectProperty()
        : ''
  } else {
    name = this.object.name || ''
  }

  this.name = () => name
}

AccessorNode.prototype = new Node()

AccessorNode.prototype.type = 'ACCESSOR'

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

  const object = compile(node.object, defs, args);
  const index = compile(node.index, defs, args);

  if(node.index.isObjectProperty()) {
    const jsProp = stringify(node.index.getObjectProperty())
    return `getSafeProperty(${object}, ${jsProp})`
  } else if(node.index.needsSize()) {
    // if some parameters use the 'end' parameter, we need to calculate the size
    return `(function () {
          var object = ${object}
          var size = math.size(object).valueOf()
          return access(object, ${index})
        })()`
  }
  else {
    return `access(${object}, ${index})`
  }
}

// register the compile function
register(AccessorNode.prototype.type, compileAccessorNode)
