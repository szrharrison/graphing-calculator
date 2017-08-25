const compileFunctions = {}

/**
 * Register a compile function for a node
 * @param {string} type
 * @param {function} compileFunction
 *                      The compile function, invoked as
 *                      compileFunction(node, defs, args)
 */
export const register = (type, compileFunction) => {
  if (compileFunctions[type] === undefined) {
    compileFunctions[type] = compileFunction
  }
  else {
    throw new Error(`Cannot register type "${type}": already exists`)
  }
}

/**
 * Compile a Node into JavaScript
 * @param {Node} node
 * @param {Object} defs     Object which can be used to define functions
 *                          or constants globally available for the compiled
 *                          expression
 * @param {Object} args     Object with local function arguments, the key is
 *                          the name of the argument, and the value is `true`.
 *                          The object may not be mutated, but must be
 *                          extended instead.
 * @return {string} Returns JavaScript code
 */
const compile = (node, defs, args) => {
  if (compileFunctions.hasOwnProperty(node.type)) {
    var compileFunction = compileFunctions[node.type]
    return compileFunction(node, defs, args)
  } else if(typeof node._compile === 'function' &&
      !node.hasOwnProperty('_compile')) {
    // Compatibility for CustomNodes
    return node._compile(defs, args)
  } else {
    throw new Error(`Cannot compile node: unknown type "${node.type}"`)
  }
}

export default compile
