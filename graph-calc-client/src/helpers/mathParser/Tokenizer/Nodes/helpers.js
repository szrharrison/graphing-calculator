import operators from '../../helpers/operators'
/**
 * Get a unique name for an argument name to store in defs
 * @param {Object} defs
 * @return {string} A string like 'arg1', 'arg2', ...
 * @public
 */
export const getUniqueArgumentName = defs => `arg${Object.keys(defs).length}`

/**
 * Calculate which parentheses are necessary. Gets an OperatorNode
 * (which is the root of the tree) and an Array of Nodes
 * (this.args) and returns an array where 'true' means that an argument
 * has to be enclosed in parentheses whereas 'false' means the opposite.
 *
 * @param {OperatorNode} root
 * @param {string} parenthesis
 * @param {Node[]} args
 * @param {boolean} latex
 * @return {boolean[]}
 * @public
 */
export const calculateNecessaryParentheses = (root, parenthesis, implicit, args, latex) => {
  //precedence of the root OperatorNode
  const precedence = operators.getPrecedence(root, parenthesis);
  const associativity = operators.getAssociativity(root, parenthesis);

  if(
    (parenthesis === 'all') ||
    (
      (args.length > 2) &&
      (root.getIdentifier() !== 'OperatorNode:add') &&
      (root.getIdentifier() !== 'OperatorNode:multiply')
    )
  ) {
    const parens = args.map( arg => {
      switch (arg.getContent().type) { //Nodes that don't need extra parentheses
        case 'ArrayNode':
          // fallthrough
        case 'ConstantNode':
          // fallthrough
        case 'SymbolNode':
          // fallthrough
        case 'ParenthesisNode':
          return false
        default:
          return true
      }
    })
    return parens
  }

  let result = undefined
  switch (args.length) {
    case 0:
      result = []
      break
    case 1: //unary operators
      //precedence of the operand
      const operandPrecedence = operators.getPrecedence(args[0], parenthesis)

      //handle special cases for LaTeX, where some of the parentheses aren't needed
      if(latex && (operandPrecedence !== null)) {
        let operandIdentifier,
            rootIdentifier
        if(parenthesis === 'keep') {
          operandIdentifier = args[0].getIdentifier()
          rootIdentifier = root.getIdentifier()
        } else {
          //Ignore Parenthesis Nodes when not in 'keep' mode
          operandIdentifier = args[0].getContent().getIdentifier()
          rootIdentifier = root.getContent().getIdentifier()
        }
        if(operators.properties[precedence][rootIdentifier].latexLeftParens === false) {
          result = [false]
          break
        }

        if(operators.properties[operandPrecedence][operandIdentifier].latexParens === false) {
          result = [false]
          break
        }
      }

      if(operandPrecedence === null) {
        //if the operand has no defined precedence, no parens are needed
        result = [false]
        break
      }

      if (operandPrecedence <= precedence) {
        //if the operands precedence is lower, parens are needed
        result = [true]
        break
      }

      //otherwise, no parens needed
      result = [false]
      break

    case 2: //binary operators
      let lhsParens //left hand side needs parenthesis?
      //precedence of the left hand side
      const lhsPrecedence = operators.getPrecedence(args[0], parenthesis);
      //is the root node associative with the left hand side
      const assocWithLhs = operators.isAssociativeWith(root, args[0], parenthesis);

      if(lhsPrecedence === null) {
        //if the left hand side has no defined precedence, no parens are needed
        //FunctionNode for example
        lhsParens = false
      } else if((lhsPrecedence === precedence) && (associativity === 'right') && !assocWithLhs) {
        //In case of equal precedence, if the root node is left associative
        // parens are **never** necessary for the left hand side.
        //If it is right associative however, parens are necessary
        //if the root node isn't associative with the left hand side
        lhsParens = true
      } else if(lhsPrecedence < precedence) {
        lhsParens = true
      } else {
        lhsParens = false
      }

      let rhsParens //right hand side needs parenthesis?
      //precedence of the right hand side
      const rhsPrecedence = operators.getPrecedence(args[1], parenthesis);
      //is the root node associative with the right hand side?
      const assocWithRhs = operators.isAssociativeWith(root, args[1], parenthesis);

      if(rhsPrecedence === null) {
        //if the right hand side has no defined precedence, no parens are needed
        //FunctionNode for example
        rhsParens = false
      } else if((rhsPrecedence === precedence) &&
                (
                  (associativity === 'left') &&
                  !assocWithRhs)
                ) {
        //In case of equal precedence, if the root node is right associative
        // parens are **never** necessary for the right hand side.
        //If it is left associative however, parens are necessary
        //if the root node isn't associative with the right hand side
        rhsParens = true
      } else if(rhsPrecedence < precedence) {
        rhsParens = true
      } else {
        rhsParens = false
      }

      //handle special cases for LaTeX, where some of the parentheses aren't needed
      if(latex) {
        let rootIdentifier,
            lhsIdentifier,
            rhsIdentifier
        if(parenthesis === 'keep') {
          rootIdentifier = root.getIdentifier()
          lhsIdentifier = root.args[0].getIdentifier()
          rhsIdentifier = root.args[1].getIdentifier()
        } else {
          //Ignore ParenthesisNodes when not in 'keep' mode
          rootIdentifier = root.getContent().getIdentifier()
          lhsIdentifier = root.args[0].getContent().getIdentifier()
          rhsIdentifier = root.args[1].getContent().getIdentifier()
        }

        if(lhsPrecedence !== null) {
          if(operators.properties[precedence][rootIdentifier].latexLeftParens === false) {
            lhsParens = false
          }

          if (operators.properties[lhsPrecedence][lhsIdentifier].latexParens === false) {
            lhsParens = false
          }
        }

        if(rhsPrecedence !== null) {
          if(operators.properties[precedence][rootIdentifier].latexRightParens === false) {
            rhsParens = false
          }

          if(operators.properties[rhsPrecedence][rhsIdentifier].latexParens === false) {
            rhsParens = false
          }
        }
      }

      result = [lhsParens, rhsParens];
      break

    default:
      if(
        (root.getIdentifier() === 'OperatorNode:add') ||
        (root.getIdentifier() === 'OperatorNode:multiply')
      ) {
        result = args.map(arg => {
          const argPrecedence = operators.getPrecedence(arg, parenthesis)
          const assocWithArg = operators.isAssociativeWith(root, arg, parenthesis)
          const argAssociativity = operators.getAssociativity(arg, parenthesis)
          if(argPrecedence === null) {
            //if the argument has no defined precedence, no parens are needed
            return false
          } else if(
            (precedence === argPrecedence) &&
            (associativity === argAssociativity) &&
            !assocWithArg
          ) {
            return true
          } else if(argPrecedence < precedence) {
            return true
          }

          return false
        })
      }
  }

  //handles an edge case of 'auto' parentheses with implicit multiplication of ConstantNode
  //In that case print parentheses for ParenthesisNodes even though they normally wouldn't be
  //printed.
  if(
    (args.length >= 2) &&
    (root.getIdentifier() === 'OperatorNode:multiply') &&
    root.implicit &&
    (parenthesis === 'auto') &&
    (implicit === 'hide')
  ) {
    result = args.map( (arg, index) => {
      const isParenthesisNode = (arg.getIdentifier() === 'ParenthesisNode')
      if(result[index] || isParenthesisNode) { //put in parenthesis?
        return true
      }
      return false
    })
  }

  return result
}
