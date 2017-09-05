const latex = {}

latex.symbols = {
  // GREEK LETTERS
  Alpha: 'A',             alpha: '\\alpha',
  Beta: 'B',              beta: '\\beta',
  Gamma: '\\Gamma',       gamma: '\\gamma',
  Delta: '\\Delta',       delta: '\\delta',
  Epsilon: 'E',           epsilon: '\\epsilon',       varepsilon: '\\varepsilon',
  Zeta: 'Z',              zeta: '\\zeta',
  Eta: 'H',               eta: '\\eta',
  Theta: '\\Theta',       theta: '\\theta',           vartheta: '\\vartheta',
  Iota: 'I',              iota: '\\iota',
  Kappa: 'K',             kappa: '\\kappa',           varkappa: '\\varkappa',
  Lambda: '\\Lambda',     lambda: '\\lambda',
  Mu: 'M',                mu: '\\mu',
  Nu: 'N',                nu: '\\nu',
  Xi: '\\Xi',             xi: '\\xi',
  Omicron: 'O',           omicron: 'o',
  Pi: '\\Pi',             pi: '\\pi',                 varpi: '\\varpi',
  Rho: 'P',               rho: '\\rho',               varrho: '\\varrho',
  Sigma: '\\Sigma',       sigma: '\\sigma',           varsigma: '\\varsigma',
  Tau: 'T',               tau: '\\tau',
  Upsilon: '\\Upsilon',   upsilon: '\\upsilon',
  Phi: '\\Phi',           phi: '\\phi',               varphi: '\\varphi',
  Chi: 'X',               chi: '\\chi',
  Psi: '\\Psi',           psi: '\\psi',
  Omega: '\\Omega',       omega: '\\omega',
  //logic
  'true': '\\mathrm{True}',
  'false': '\\mathrm{False}',
  //other
  i: 'i', //TODO use \i ??
  inf: '\\infty',
  Inf: '\\infty',
  infinity: '\\infty',
  Infinity: '\\infty',
  oo: '\\infty',
  lim: '\\lim',
  'undefined': '\\mathbf{?}'
}

latex.operators = {
  'transpose': '^\\intercal',
  'factorial': '!',
  'pow': '^',
  'dotPow': '.^\\wedge', //TODO find ideal solution
  'unaryPlus': '+',
  'unaryMinus': '-',
  'bitNot': '~', //TODO find ideal solution
  'not': '\\neg',
  'multiply': '\\cdot',
  'divide': '\\frac', //TODO how to handle that properly?
  'dotMultiply': '.\\cdot', //TODO find ideal solution
  'rDotDivide': './', //TODO find ideal solution
  'lDotDivide': '.\\',
  'mod': '\\mod',
  'add': '+',
  'subtract': '-',
  'to': '\\rightarrow',
  'leftShift': '<<',
  'rightArithShift': '>>',
  'rightLogShift': '>>>',
  'equal': '=',
  'unequal': '\\neq',
  'smaller': '<',
  'larger': '>',
  'lesserEq': '\\leq',
  'greaterEq': '\\geq',
  'bitAnd': '\\&',
  'bitXor': '\\underline{|}',
  'bitOr': '|',
  'and': '\\wedge',
  'xor': '\\veebar',
  'or': '\\vee'
}

// template string expression is used here for latex syntax and is intentional
latex.defaultTemplate = '\\mathrm{${name}}\\left(${args}\\right)'     // eslint-disable-line

const units = {
  deg: '˚'
}

//@param {string} name
//@param {boolean} isUnit
latex.toSymbol = function(name, isUnit) {
  isUnit = (typeof isUnit === 'undefined') ? false : isUnit
  if(isUnit) {
    if(units.hasOwnProperty(name)) {
      return units[name]
    }
    return `\\mathrm{${name}}`
  }

  if (latex.symbols.hasOwnProperty(name)) {
    return latex.symbols[name]
  } else if(name.indexOf('_') !== -1) {
    //symbol with index (eg. alpha_1)
    const index = name.indexOf('_')
    return `${latex.toSymbol(name.substring(0, index))}_{${exports.toSymbol(name.substring(index + 1))}}`
  }
  return name
}

export default latex
