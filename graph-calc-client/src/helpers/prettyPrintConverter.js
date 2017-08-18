import _ from 'lodash'

import matchNested from './matchNested'

class PrettyPrint {

  // splitParens = (input) => {
  //   const operations = matchNested(input, '(...)')
  //   if( operations.length === 0 ) {
  //     return input
  //   } else {
  //     return operations.map( operation => this.splitParens(operation) )
  //   }
  // }

  toTex = input => {
    let output = input

    const dictionary = {
      '\\|': '\\Bigg{|}',
      '>=': '\\geq',
      '<=': '\\leq',
      '\\(': '\\left(',
      '\\)': '\\right)',
      'sin': '\\sin',
      'cos': '\\cos',
      'tan': '\\tan',
      'cot': '\\cot',
      'arcsin': '\\sin^{-1}',
      'arccos': '\\cos^{-1}',
      'arctan': '\\tan^{-1}',
      'arccot': '\\cot^{-1}',
      'sinh': '\\sinh',
      'cosh': '\\cosh',
      'tanh': '\\tanh',
      'coth': '\\coth',
      'sec': '\\sec',
      'csc': '\\csc',
      '!=': '\\neq',
      '/=': '\\neq',
      '=/': '\\neq',
      '\\\\int': '\\int\\limits',
      '\\*': '\\cdot ',
      '^T': '^\\intercal',
      '^G': '^\\mathsf{G}',
      '^r': '^\\mathsf{r}',
      '(\\((.+?)\\)|[^+\\-*/()=\\s|]+)\\/\\/(\\((.+?)\\)|[^\\s+\\-*/=|()]+)': function(match, p1, p2, p3, p4) {
        console.log({match, p1, p2, p3, p4})
        if(p2 && p4) {
          return `\\frac{${p2}}{${p4}}`
        } else if (p2) {
          return `\\frac{${p2}}{${p3}}`
        } else if (p4) {
          return `\\frac{${p1}}{${p4}}`
        } else {
          return `\\frac{${p1}}{${p3}}`
        }
      },
      '\\\\deg': '˚',
      '\\\\E': '\\mathrm{\\scriptsize{E}}'
    }
    _.forIn(dictionary, function(value, key) {
      output = output.replace(new RegExp(key, 'g'), value)
    })

    return output
  }
}

export default PrettyPrint
