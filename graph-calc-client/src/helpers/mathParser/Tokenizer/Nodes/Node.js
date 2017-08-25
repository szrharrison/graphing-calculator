import compile from '../../compile'
import AccessorNode from './AccessorNode'
import ArrayNode from './ArrayNode'
import AssignmentNode from './AssignmentNode'
import BlockNode from './BlockNode'
import ConditionalNode from './ConditionalNode'
import FunctionAssignmentNode from './FunctionAssignmentNode'
import FunctionNode from './FunctionNode'
import IndexNode from './IndexNode'
import ObjectNode from './ObjectNode'
import OperatorNode from './OperatorNode'
import ParenthesesNode from './ParenthesesNode'
import RangeNode from './RangeNode'

const buildAccessor = options => new AccessorNode(options)
const buildArray = options => new ArrayNode(options)
const buildAssignment = options => new AssignmentNode(options)
const buildBlock = options => new BlockNode(options)
const buildConditional = options => new ConditionalNode(options)
const buildFunctionAssignment = options => new FunctionAssignmentNode(options)
const buildFunction = options => new FunctionNode(options)
const buildIndex = options => new IndexNode(options)
const buildObject = options => new ObjectNode(options)
const buildOperator = options => new OperatorNode(options)
const buildParentheses = options => new ParenthesesNode(options)
const buildRange = options => new RangeNode(options)

const TYPES = {
  ACCESSOR: buildAccessor,
  ARRAY: buildArray,
  ASSIGNMENT: buildAssignment,
  BLOCK: buildBlock,
  CONDITIONAL: buildConditional,
  FUNCTION_ASSIGNMENT: buildFunctionAssignment,
  FUNCTION: buildFunction,
  INDEX: buildIndex,
  OBJECT: buildObject,
  OPERATOR: buildOperator,
  PARENTHESES: buildParentheses,
  RANGE: buildRange
}

function Node() {
  if (!(this instanceof Node)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }
}

Node.prototype.create = function(type, ...options) {
  let node

  if(TYPE.hasOwnProperty(type)) {
    node = TYPE[type](options)
  } else {
    throw new SyntaxError('Unkown Node Type')
  }

  return node
}

/**
 * Evaluate the node
 * @param {Object} [scope]  Scope to read/write variables
 * @param {Object} [math]   Math to... ?
 * @return {*}              Returns the result
 */
Node.prototype.eval = function(scope, math) {
  const defs = {
    math: math.expression.mathWithTransform,
    args: {}, // can be filled with names of FunctionAssignment arguments
    _validateScope: _validateScope
  }

  const args = {}
  const code = compile(this, defs, args)

  const defsCode = Object.keys(defs).map(name => `    const ${name} = defs["${name}"];`)

  var factoryCode =
      `${defsCode.join(' ')}
      return {
        eval: function (scope) {
          if (scope) _validateScope(scope);
          scope = scope || {};
          return ${code};
        }
      };`;

  const factory = new Function('defs', factoryCode);
  return factory(defs).eval(scope)
}

Node.prototype.type = 'NODE'

Node.prototype.isNode = true

Node.prototype.comment = ''

/**
 * Create a deep clone of this node
 * @return {Node}
 */
Node.prototype.cloneDeep = function () {
  return this.map(function (node) {
    return node.cloneDeep()
  })
}

export default Node
