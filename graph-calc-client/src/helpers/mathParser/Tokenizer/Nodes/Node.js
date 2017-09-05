import compile from '../../helpers/compile'
import { keywords } from '../../../constants'

function Node() {
  if(!(this instanceof Node)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }
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

  const defsCode = Object.keys(defs).map(name => `    const ${name} = defs["${name}"]`)

  const factoryCode =
      `${defsCode.join('\n')}
      return {
        eval: function (scope) {
          if (scope) _validateScope(scope)
          scope = scope ? scope : {}
          return ${code}
        }
      }`

  const factory = new Function('defs', factoryCode) // eslint-disable-line
  return factory(defs).eval(scope)
}

/**
 * Validate the symbol names of a scope.
 * Throws an error when the scope contains an illegal symbol.
 * @param {Object} scope
 */
const _validateScope = scope => {
  for(let symbol in scope) {
    if(scope.hasOwnProperty(symbol)) {
      if(symbol in keywords) {
        throw new Error(`Scope contains an illegal symbol, "${symbol}" is a reserved keyword`)
      }
    }
  }
}

Node.prototype.type = 'Node'

Node.prototype.isNode = true

Node.prototype.comment = ''

/**
 * Create a deep clone of this node
 * @return {Node}
 */
Node.prototype.cloneDeep = function() {
  return this.map( node => node.cloneDeep() )
}

export default Node
