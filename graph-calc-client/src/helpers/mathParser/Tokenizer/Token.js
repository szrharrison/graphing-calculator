/* Tokens: {
  Literals,
  Variables,
  Operators,
  Functions,
  Function Argument Separators,
  Open Parentheses,
  Close Parentheses
}
*/

function Token(type, value) {
  this.type = type
  this.value = value
}

export default Token
