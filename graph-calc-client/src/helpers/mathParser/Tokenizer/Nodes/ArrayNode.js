import Node from './Node'
import compile, { register } from '../../helpers/compile'
import { type } from '../../helpers/types'
import arrFunctions from '../../helpers/mathTypes/Array/functions/array'

const { map, join } = arrFunctions

/**
 * @constructor ArrayNode
 * @extends {Node}
 * Holds an 1-dimensional array with items
 * @param {Node[]} [items]   1 dimensional array with items
 */
function ArrayNode(items) {
  if(!(this instanceof ArrayNode)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  this.items = items || []

  // validate input
  if(!Array.isArray(this.items) || !this.items.every(type.isNode)) {
    throw new TypeError('Array containing Nodes expected')
  }
}

// Type definitions
ArrayNode.prototype = new Node()

ArrayNode.prototype.type = 'ArrayNode'

ArrayNode.prototype.isArrayNode = true

/**
 * Compile the node to javascript code
 * @param {ArrayNode} node  Node to be compiled
 * @param {Object} defs     Object which can be used to define functions
 *                          or constants globally available for the compiled
 *                          expression
 * @param {Object} args     Object with local function arguments, the key is
 *                          the name of the argument, and the value is `true`.
 *                          The object may not be mutated, but must be
 *                          extended instead.
 * @private
 */
const compileArrayNode = (node, defs, args) => {
  if(!(node instanceof ArrayNode)) {
    throw new TypeError('No valid ArrayNode')
  }

  const asMatrix = (defs.math.config().matrix !== 'Array')

  const items = map(node.items, item => compile(item, defs, args) )

  return `${(asMatrix ? 'math.matrix([' : '[')}${join(items, ',')}${(asMatrix ? '])' : ']')}`
}

// register the compile function
register(ArrayNode.prototype.type, compileArrayNode);

    /**
 * Execute a callback for each of the child nodes of this node
 * @param {function(child: Node, path: string, parent: Node)} callback
 */
ArrayNode.prototype.forEach = function (callback) {
  for (var i = 0; i < this.items.length; i++) {
    var node = this.items[i];
    callback(node, 'items[' + i + ']', this);
  }
};

/**
 * Create a new ArrayNode having it's childs be the results of calling
 * the provided callback function for each of the childs of the original node.
 * @param {function(child: Node, path: string, parent: Node): Node} callback
 * @returns {ArrayNode} Returns a transformed copy of the node
 */
ArrayNode.prototype.map = function (callback) {
  var items = [];
  for (var i = 0; i < this.items.length; i++) {
    items[i] = this._ifNode(callback(this.items[i], 'items[' + i + ']', this));
  }
  return new ArrayNode(items);
};

/**
 * Create a clone of this node, a shallow copy
 * @return {ArrayNode}
 */
ArrayNode.prototype.clone = function() {
  return new ArrayNode(this.items.slice(0));
};

/**
 * Get string representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
ArrayNode.prototype._toString = function(options) {
  var items = this.items.map(function (node) {
    return node.toString(options);
  });
  return '[' + items.join(', ') + ']';
};

/**
 * Get HTML representation
 * @param {Object} options
 * @return {string} str
 * @override
 */
ArrayNode.prototype.toHTML = function(options) {
  var items = this.items.map(function (node) {
    return node.toHTML(options);
  });
  return '<span class="math-parenthesis math-square-parenthesis">[</span>' + items.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-square-parenthesis">]</span>';
};

/**
 * Get LaTeX representation
 * @param {Object} options
 * @return {string} str
 */
ArrayNode.prototype._toTex = function(options) {
  var s = '\\begin{bmatrix}';

  this.items.forEach(function(node) {
    if (node.items) {
      s += node.items.map(function(childNode) {
        return childNode.toTex(options);
      }).join('&');
    }
    else {
      s += node.toTex(options);
    }

    // new line
    s += '\\\\';
  });
  s += '\\end{bmatrix}';
  return s;
}

export default ArrayNode
