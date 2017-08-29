import Node from './Nodes/Node'
import { NAMED_DELIMITERS, TOKENTYPE } from '../../constants'
import { ParseError, TokenSyntaxError } from '../Errors'
import Expression from './Expression'
import { type } from '../helpers/types'

function Tokenizer() {
  let extra_nodes = {}              // current extra nodes
  let expression = new Expression() // current expression
  let errors = []                    // error to be displayed with input

  /**
   * Parse an expression. Returns a node tree, which can be evaluated by
   * invoking XXXX
   *
   * Syntax:
   *     tokenize(expr)
   *     tokenize([expr1, expr2, expr3, ...])

   *
   * @param {string | string[] | Matrix} expr
   * @return {Token | Token[]} token
   * @public
   */
  this.tokenize = (expr, options) => {
    if(typeof expr === 'string') {
      expression.set(expr)
      return parseStart()
    } else if(Array.isArray(expr)) {
      expr.map( elem => {
        if(typeof elem !== 'string') {
          errors.push(new ParseError(`String expected. Instead, got ${elem}`))
        }
        expression.set(elem)
        return parseStart()
      })
    } else {
      errors.push(new ParseError(`Array or string expected. Instead, got ${expr}`))
    }
  }

  /**
   * Start of the parse levels below, in order of precedence
   * @return {Node} node
   * @private
   */
  const parseStart = () => {
    expression.first()
    expression.nextToken()

    let node = parseBlock()

    if(expression.token.string !== '') {
      if(expression.token.type === TOKENTYPE.DELIMETER) {
        errors.push(new TokenSyntaxError(`Unexpected operator ${expression.token.string}`))
      } else {
        errors.push(new TokenSyntaxError(`Unexpected part ${expression.token.string}`))
      }
    }

    return node
  }

  /**
   * Parse a block with expressions. Expressions can be separated by a newline
   * character '\n', or by a semicolon ';'. In case of a semicolon, no output
   * of the preceding line is returned.
   * @return {Node} node
   * @private
   */
  const parseBlock = () => {
    let blocks = []
    let node

    if(expression.token.string !== '' && expression.token.string !== '\n' && expression.token.string !== ';') {
      node = parseAssignment()
      node.comment = expression.comment
    }

    while(expression.token.string === '\n' || expression.token.string === ';') {
      addBlock(blocks, node)
      expression.nextToken()
      addBlock(blocks, node)
    }

    if(blocks.length > 0) {
      node = new Node('BLOCK', blocks)
    } else {
      if(!node) {
        node = new Node('CONSTANT', 'undefined', 'undefined')
        node.comment = expression.comment
      }
    }
    return node
  }

  const addBlock = (blocks, node) => {
    if(blocks.length === 0 && node) {
      const visible = (expression.token.string !== ';')
      blocks.push({
        node,
        visible
      })
    }
  }

  /**
   * Assignment of a function or variable,
   * - can be a variable like 'a=2.3'
   * - or a updating an existing variable like 'matrix(2,3:5)=[6,7,8]'
   * - defining a function like 'f(x) = x^2'
   * @return {Node} node
   * @private
   */
  const parseAssignment = () => {
    let name, args, value, valid

    let node = parseConditional()

    if(expression.token.string === '=') {
      if(type.isSymbol(node)) {
        name = node.name
        expression.nextTokenSkipNewline()
        value = parseAssignment()
        node = new Node('ASSIGNMENT', new Node('SYMBOL', value))
      } else if(type.isAccessor(node)) {
        expression.nextTokenSkipNewline()
        value = parseAssignment()
        node = new Node('ASSIGNMENT', node.object, node.i, value)
      } else if(type.isFunction(node)) {
        valid = true
        args = []
        name = node.name
        node.args.forEach( (arg, index) => {
          if(type.isSymbol(arg)) {
            args[index] = arg.name
          } else {
            valid = false
          }
        })

        if(valid) {
          expression.nextTokenSkipNewline()
          value = parseAssignment()
          node = new Node('FUNCTION_ASSIGNMENT', name, args, value)
        } else {
          errors.push(new TokenSyntaxError('Invalid left hand side of assignment operator "="'))
        }
      }
    }

    return node
  }

  /**
   * conditional operation
   *
   *     condition ? truePart : falsePart
   *
   * Note: conditional operator is right-associative
   *
   * @return {Node} node
   * @private
   */
  const parseConditional = () => {
    let node = parseLogicalOr()

    while(expression.token.string === '?') {
      const prev = expression.conditional_level
      expression.conditional_level = expression.nesting_level
      expression.nextTokenSkipNewline()

      const condition = node
      const trueExpr = parseAssignment()

      if(expression.token.string !== ':') {
        errors.push(new TokenSyntaxError('False part of conditional expression expected.'))
      }
      expression.conditional_level = null
      expression.nextTokenSkipNewline()

      const falseExpr = parseAssignment()

      node = new Node('CONDITIONAL', condition, trueExpr, falseExpr)

      expression.conditional_level = prev
    }

    return node
  }

  /**
   * logical or, 'x or y'
   * @return {Node} node
   * @private
   */
  const parseLogicalOr = () => {
    let node = parseLogicalXor()

    while(expression.token.string === 'or') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', 'or', 'or', [node, parseLogicalXor()])
    }

    return node
  }

  /**
   * logical exclusive or, 'x xor y'
   * @return {Node} node
   * @private
   */
  const parseLogicalXor = () => {
    let node = parseLogicalAnd()

    while(expression.token.string === 'xor') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', 'xor', 'xor', [node, parseLogicalAnd()])
    }

    return node
  }

  /**
   * logical and, 'x and y'
   * @return {Node} node
   * @private
   */
  const parseLogicalAnd = () => {
    let node = parseBitwiseOr()

    while(expression.token.string === 'and') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', 'and', 'and', [node, parseBitwiseOr()])
    }

    return node
  }

  /**
   * bitwise or, 'x | y'
   * @return {Node} node
   * @private
   */
  const parseBitwiseOr = () => {
    let node = parseBitwiseXor()

    while(expression.token.string === '|') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', '|', 'bitOr', [node, parseBitwiseXor()])
    }

    return node
  }

  /**
   * bitwise exclusive or (xor), 'x ^| y'
   * @return {Node} node
   * @private
   */
  const parseBitwiseXor = () => {
    let node = parseBitwiseAnd()

    while(expression.token.string === '^|') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', '^|', 'bitXor', [node, parseBitwiseAnd()])
    }

    return node
  }

  /**
   * bitwise and, 'x & y'
   * @return {Node} node
   * @private
   */
  const parseBitwiseAnd = () => {
    let node = parseRelational()

    while(expression.token.string === '&') {
      expression.nextTokenSkipNewline()
      node = new Node('OPERATOR', '&', 'bitAnd', [node, parseRelational()])
    }

    return node
  }

  /**
   * relational operators
   * @return {Node} node
   * @private
   */
  const parseRelational = () => {
    let name, fn, params

    let node = parseConversion()

    const operators = {
      '==': 'equal',
      '!=': 'unequal',
      '<': 'less',
      '>': 'greater',
      '<=': 'lessEq',
      '>=': 'greaterEq'
    }

    while(operators.hasOwnProperty(expression.token.string)) {
      name = expression.token.string
      fn = operators[name]

      expression.nextTokenSkipNewline()
      params = [node, parseConversion()]
      node = new Node('OPERATOR', name, fn, params)
    }

    return node
  }

  /**
   * conversion operators 'to' and 'in'
   * @return {Node} node
   * @private
   */
  const parseConversion = () => {
    let node = parseRange()

    while(expression.token.string === 'to') {
      expression.nextTokenSkipNewline()

      node = new Node('OPERATOR', 'to', 'to', [node, parseRange()])
    }

    return node
  }

  /**
   * parse range, "start:end", "start:step:end", ":", "start:", ":end", etc
   * @return {Node} node
   * @private
   */
  const parseRange = () => {
    let node, params

    if(expression.token.string === ':') {
      // implicit start=1 (one-based)
      node = new Node('LITERAL', 1, 'number')
    } else {
      node = parseAddSubtract()
    }

    if(expression.token.string === ':' &&
        (expression.conditional_level !== expression.nesting_level)
      ) {
      // we ignore the range operator when a conditional operator is being processed on the same level
      params = [node]

      while(expression.token.string === ':' && params.length < 3) {
        expression.nextTokenSkipNewline()

        if(expression.token.string === ')' ||
          expression.token.string === ']' ||
          expression.token.string === ',' ||
          expression.token.string === '') {
          // implicit end
          params.push(new Node('SYMBOL', 'end'))
        } else {
          params.push(parseAddSubtract())
        }
      }

      if(params.length === 3) {
        // params = [start, step, end]
        node = new Node('RANGE', params[0], params[2], params[1]) // start, end, step
      } else { // length === 2
        // params = [start, end]
        node = new Node('RANGE', params[0], params[1]) // start, end
      }
    }

    return node
  }

  /**
   * add or subtract
   * @return {Node} node
   * @private
   */
  const parseAddSubtract = () => {
    let name, fn, params

    let node = parseMultiplyDivide()

    const operators = {
      '+': 'add',
      '-': 'subtract'
    }

    while(operators.hasOwnProperty(expression.token.string)) {
      name = expression.token.string
      fn = operators[expression.token.string]

      expression.nextTokenSkipNewline()
      params = [node, parseMultiplyDivide()]
      node = new Node('OPERATOR', name, fn, params)
    }

    return node
  }

  /**
   * multiply, divide, modulus
   * @return {Node} node
   * @private
   */
  const parseMultiplyDivide = () => {
    let name, fn
    let node = parseUnary()
    let last = node


    const operators = {
      '*': 'multiply',
      '.*': 'dotMultiply',
      '/': 'divide',
      './': 'dotDivide',
      '%': 'mod',
      'mod': 'mod'
    }

    while(true) {
      if(operators.hasOwnProperty(expression.token.string)) {
        // explicit operators
        name = expression.token.string
        fn = operators[name]

        expression.nextTokenSkipNewline()

        last = parseUnary()
        node = new Node('OPERATOR', name, fn, [node, last]);
      } else if(
            (expression.token.type === TOKENTYPE.SYMBOL) ||              // :Symbol
            (expression.token.string === 'in' && type.isConstantNode(node)) ||  // :Symbol
            (
              expression.token.type === TOKENTYPE.NUMBER &&              // :Number
              !type.isConstantNode(last) &&
              (!type.isOperatorNode(last) || last.op === '!')
            ) ||
            (expression.token.string === '(')                                   // :Parenthesis
          ) {
        // parse implicit multiplication
        //
        // symbol:      implicit multiplication like '2a', '(2+3)a', 'a b'
        // number:      implicit multiplication like '(2+3)2'
        // parenthesis: implicit multiplication like '2(3+4)', '(3+4)(1+2)'
        last = parseUnary()
        node = new Node('OPERATOR', '*', 'multiply', [node, last], true /*implicit*/)
      } else {
        break
      }
    }

    return node
  }

  /**
   * Unary plus and minus, and logical and bitwise not
   * @return {Node} node
   * @private
   */
  const parseUnary = () => {
    let name, params, fn

    let node = parsePower()

    let operators = {
      '-': 'unaryMinus',
      '+': 'unaryPlus',
      '~': 'bitNot',
      'not': 'not'
    }

    while(operators.hasOwnProperty(expression.token.string)) {
      name = expression.token.string
      fn = operators[expression.token.string]

      expression.nextTokenSkipNewline()

      params = [parseUnary()]
      node = new Node('OPERATOR', name, fn, params)
    }

    return node
  }

  /**
   * power
   * Note: power operator is right associative
   * @return {Node} node
   * @private
   */
  const parsePower = () => {
    let name, fn, params

    let node = parseLeftHandOperators()

    while(expression.token.string === '^' || expression.token.string === '.^') {
      name = expression.token.string
      fn = expression.token.string === '^' ? 'power' : 'dotPower'

      expression.nextTokenSkipNewline()
      params = [node, parseUnary()]

      node = new Node('OPERATOR', name, fn, params)
    }

    return node
  }

  /**
   * Left hand operators: factorial x!, transpose x'
   * @return {Node} node
   * @private
   */
  const parseLeftHandOperators = () => {
    let name, fn, params

    let node = parseCustomNodes()

    let operators = {
      '!': 'factorial',
      '\'': 'transpose'
    }

    while(operators.hasOwnProperty(expression.token.string)) {
      name = expression.token.string
      fn = operators[expression.token.string]

      expression.nextTokenSkipNewline()
      params = [node]

      node = new Node('OPERATOR', name, fn, params)
      node = parseAccessors(node)
    }

    return node
  }

  /**
   * Parse a custom node handler. A node handler can be used to process
   * nodes in a custom way, for example for handling a plot.
   *
   * A handler must be passed as second argument of the parse function.
   * - must extend math.expression.node.Node
   * - must contain a function _compile(defs: Object) : string
   * - must contain a function find(filter: Object) : Node[]
   * - must contain a function toString() : string
   * - the constructor is called with a single argument containing all parameters
   *
   * For example:
   *
   *     nodes = {
   *       'plot': PlotHandler
   *     };
   *
   * The constructor of the handler is called as:
   *
   *     node = new PlotHandler(params);
   *
   * The handler will be invoked when evaluating an expression like:
   *
   *     node = math.parse('plot(sin(x), x)', nodes);
   *
   * @return {Node} node
   * @private
   */
  const parseCustomNodes = () => {
    let params = []

    if(expression.token.type === TOKENTYPE.SYMBOL && extra_nodes.hasOwnProperty(expression.token.string)) {
      let CustomNode = extra_nodes[expression.token.string]

      expression.nextToken()
      // parse parameters
      if(expression.token.string === '(') {
        params = []

        expression.paramsStart()
        expression.nextToken()

        if(expression.token.string !== ')') {
          params.push(parseAssignment())

          // parse a list with parameters
          while(expression.token.string === ',') {
            expression.nextToken()
            params.push(parseAssignment())
          }
        }

        if(expression.token.string !== ')') {
          errors.push(new TokenSyntaxError('Parenthesis ) expected'))
        }
        expression.paramsEnd()
        expression.nextToken()
      }

      // create a new custom node
      //noinspection JSValidateTypes
      return new CustomNode(params)
    }

    return parseSymbol()
  }

  /**
   * parse symbols: functions, variables, constants, units
   * @return {Node} node
   * @private
   */
  const parseSymbol = () => {
    let name

    let node = parseString()

    if(expression.token.type === TOKENTYPE.SYMBOL ||
        (expression.token.type === TOKENTYPE.DELIMITER && NAMED_DELIMITERS.hasOwnProperty(expression.token.string))) {
      name = expression.token.string

      expression.nextToken()

      // parse function parameters and matrix index
      node = new Node('SYMBOL', name)
      node = parseAccessors(node)
    }

    return node
  }

  /**
   * parse accessors:
   * - function invocation in round brackets (...), for example sqrt(2)
   * - index enclosed in square brackets [...], for example A[2,3]
   * - dot notation for properties, like foo.bar
   * @param {Node} node    Node on which to apply the parameters. If there
   *                       are no parameters in the expression, the node
   *                       itself is returned
   * @param {string[]} [types]  Filter the types of notations
   *                            can be: '(', '[', '.'
   * @return {Node} node
   * @private
   */
  const parseAccessors = (node, types) => {
    let params = []

    while((
      expression.token.string === '(' ||
      expression.token.string === '[' ||
      expression.token.string === '.') &&
      (!types || types.indexOf(expression.token.string) !== -1)
    ) {
      if(expression.token.string === '(') {
        if(type.isSymbolNode(node) || type.isAccessorNode(node) || type.isFunctionNode(node)) {
          // function invocation like fn(2, 3)
          expression.paramsStart()
          expression.nextToken()

          if(expression.token.string !== ')') {
            params.push(parseAssignment())

            // parse a list with parameters
            while(expression.token.string === ',') {
              expression.nextToken()
              params.push(parseAssignment())
            }
          }

          if(expression.token.string !== ')') {
            errors.push(new TokenSyntaxError('Parenthesis ) expected'))
          }
          expression.paramsEnd()
          expression.nextToken()

          node = new Node('FUNCTION', node, params)
        } else {
          // implicit multiplication like (2+3)(4+5)
          // don't parse it here but let it be handled by parseMultiplyDivide
          // with correct precedence
          return node
        }
      } else if(expression.token.string === '[') {
        // index notation like variable[2, 3]
        expression.paramsStart()
        expression.nextToken()

        if(expression.token.string !== ']') {
          params.push(parseAssignment())

          // parse a list with parameters
          while(expression.token.string === ',') {
            expression.nextToken()
            params.push(parseAssignment())
          }
        }

        if(expression.token.string !== ']') {
          errors.push(new TokenSyntaxError('Parenthesis ] expected'))
        }
        expression.paramsEnd()
        expression.nextToken()

        node = new Node('ACCESSOR', node, new Node('INDEX', params))
      } else {
        // dot notation like variable.prop
        expression.nextToken()

        if(expression.token.type !== TOKENTYPE.SYMBOL) {
          errors.push(new TokenSyntaxError('Property name expected after dot'))
        }
        params.push(new Node('CONSTANT', expression.token.string))
        expression.nextToken()

        const dotNotation = true
        node = new Node('ACCESSOR', node, new Node('INDEX', params, dotNotation))
      }
    }

    return node
  }

  /**
   * parse a string.
   * A string is enclosed by double quotes
   * @return {Node} node
   * @private
   */
  const parseString = () => {
    let str
    let node = parseMatrix()

    if(expression.token.string === '"') {
      str = parseStringToken()

      node = new Node('CONSTANT', str, 'string')

      node = parseAccessors(node)
    }

    return node
  }

  /**
   * Parse a string surrounded by double quotes "..."
   * @return {string}
   */
  const parseStringToken = () => {
    let str = ''

    while(expression.c !== '' && expression.c !== '"') {
      if(expression.c === '\\') {
        // escape character
        str += expression.c
        expression.next()
      }

      str += expression.c
      expression.next()
    }

    expression.nextToken()
    if(expression.token.string !== '"') {
      errors.push(new TokenSyntaxError('End of string " expected'))
    }
    expression.nextToken()

    return str
  }

  /**
   * parse the matrix
   * @return {Node} node
   * @private
   */
  const parseMatrix = () => {
    let rows = 0
    let params = []
    let node = parseObject()

    if(expression.token.string === '[') {
      // matrix [...]
      expression.paramsStart()
      expression.nextToken()

      if(expression.token.string !== ']') {
        // this is a non-empty matrix
        const row = parseRow()

        if(expression.token.string === ';') {
          // 2 dimensional array (non-vector)
          params[rows] = row
          rows ++

          // the rows of the matrix are separated by semicolons
          while(expression.token.string === ';') {
            expression.nextToken()

            params[rows] = parseRow()
            rows ++
          }

          if(expression.token.string !== ']') {
            errors.push(new TokenSyntaxError('End of matrix ] expected'))
          }
          expression.paramsEnd()
          expression.nextToken()

          // check if the number of columns matches in all rows
          const cols = params[0].items.length
          for(let r = 1; r < rows; r++) {
            if(params[r].items.length !== cols) {
              errors.push(new TokenSyntaxError(
                `Column dimensions mismatch (row ${r} doesn't have ${cols} columns)`
              ))
            }
          }

          node = new Node('ARRAY', params)
        } else {
          // 1 dimensional vector
          if(expression.token.string !== ']') {
            errors.push(new TokenSyntaxError('End of matrix ] expected'))
          }
          expression.paramsEnd()
          expression.nextToken()

          node = row
        }
      } else {
        // this is an empty matrix "[ ]"
        expression.paramsEnd()
        expression.nextToken()
        node = new Node('ARRAY', [])
      }
      node = parseAccessors(node)
    }

    return node
  }

  /**
   * Parse a single comma-separated row from a matrix, like 'a, b, c'
   * @return {Node} node
   */
  const parseRow = () => {
    let params = [parseAssignment()]
    let len = 1

    while(expression.token.string === ',') {
      expression.nextToken()

      // parse expression
      params[len] = parseAssignment()
      len++
    }

    return new Node('ARRAY', params)
  }

  /**
   * parse an object, enclosed in angle brackets{...}, for example {value: 2}
   * @return {Node} node
   * @private
   */
  const parseObject = () => {
    let node = parseNumber()

    if(expression.token.string === '{') {
      let key

      const properties = {}
      do {
        expression.nextToken()

        if(expression.token.string !== '}') {
          // parse key
          if(expression.token.string === '"') {
            key = parseStringToken()
          } else if(expression.token.type === TOKENTYPE.SYMBOL) {
            key = expression.token.string
            expression.nextToken()
          } else {
            errors.push(new TokenSyntaxError('Symbol or string expected as object key'))
          }

          // parse key/value separator
          if(expression.token.string !== ':') {
            errors.push(new TokenSyntaxError('Colon : expected after object key'))
          }
          expression.nextToken()

          // parse key
          properties[key] = parseAssignment()
        }
      } while(expression.token.string === ',')

      if(expression.token.string !== '}') {
        errors.push(new TokenSyntaxError('Comma , or bracket } expected after object value'))
      }
      expression.nextToken()

      node = new Node('OBJECT', properties)

      // parse index parameters
      node = parseAccessors(node)
    }

    return node
  }

  /**
   * parse a number
   * @return {Node} node
   * @private
   */
  const parseNumber = () => {
    let node = parseParentheses()

    if(expression.token.type === TOKENTYPE.NUMBER) {
      // this is a number
      const number = expression.token.string
      expression.nextToken()

      node = new Node('CONSTANT', number, 'number')
    }

    return node
  }

  /**
   * parentheses
   * @return {Node} node
   * @private
   */
  const parseParentheses = () => {
    let node = parseEnd()

    // check if it is a parenthesized expression
    if(expression.token.string === '(') {
      // parentheses (...)
      expression.paramsStart()
      expression.nextToken()

      node = parseAssignment() // start again

      if(expression.token.string !== ')') {
        errors.push(new TokenSyntaxError('Parenthesis ) expected'))
      }
      expression.paramsEnd()
      expression.nextToken()

      node = new Node('PARENTHESES', node)
      node = parseAccessors(node)
    }

    return node
  }

  /**
   * Evaluated when the expression is not yet ended but expected to end
   * @return {Node} res
   * @private
   */
  const parseEnd = () => {
    if(expression.token.string === '') {
      // syntax error or unexpected end of expression
      errors.push(new TokenSyntaxError('Unexpected end of expression'))
    } else if(expression.token.string === "'") {
      errors.push(new TokenSyntaxError('Value expected. Note: strings must be enclosed by double quotes'))
    } else {
      errors.push(new TokenSyntaxError('Value expected'))
    }
  }
}
