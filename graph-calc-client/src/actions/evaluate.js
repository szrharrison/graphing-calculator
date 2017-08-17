import PrettyPrint from '../helpers/prettyPrintConverter'

const pp = new PrettyPrint()

export const setExpression = oldExpression => {
  let expression = pp.toTex(oldExpression)
  console.log(expression)
  return {
    type: 'SET_EXPRESSION',
    expression
  }
}
