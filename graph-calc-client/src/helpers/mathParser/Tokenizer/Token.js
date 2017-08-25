function Token(string) {
  this.string = string.length ? string : ''  // current token string
  this.type = 'NULL'                  // type of the token
}

export default Token
