
export const symbols = {
  greek: {
    uppercase: {
      '&#913;': '\\Alpha',
      '&#914;': '\\Beta',
      '&#915;': '\\Gamma',
      '&#916;': '\\Delta',
      '&#917;': '\\Epsilon',
      '&#918;': '\\Zeta',
      '&#919;': '\\Eta',
      '&#920;': '\\Theta',
      '&#921;': '\\Iota',
      '&#922;': '\\Kappa',
      '&#923;': '\\Lamda',
      '&#924;': '\\Mu',
      '&#925;': '\\Nu',
      '&#926;': '\\Xi',
      '&#927;': '\\Omicron',
      '&#928;': '\\Pi',
      '&#929;': '\\Rho',
      '&#931;': '\\Sigma',
      '&#932;': '\\Tau',
      '&#933;': '\\Upsilon',
      '&#934;': '\\Phi',
      '&#935;': '\\Chi',
      '&#936;': '\\Psi',
      '&#937;': '\\Omega'
    },
    lowercase: {
      '&#945;': '\\alpha',
      '&#946;': '\\beta',
      '&#947;': '\\gamma',
      '&#948;': '\\delta',
      '&#949;': '\\epsilon',
      '&#950;': '\\zeta',
      '&#951;': '\\eta',
      '&#952;': '\\theta',
      '&#953;': '\\iota',
      '&#954;': '\\kappa',
      '&#955;': '\\lamda',
      '&#956;': '\\mu',
      '&#957;': '\\nu',
      '&#958;': '\\xi',
      '&#959;': '\\omicron',
      '&#960;': '\\pi',
      '&#961;': '\\rho',
      '&#963;': '\\sigma',
      '&#964;': '\\tau',
      '&#965;': '\\upsilon',
      '&#966;': '\\phi',
      '&#967;': '\\chi',
      '&#968;': '\\psi',
      '&#969;': '\\omega'
    }
  },
  general: {
    '&#43;': '+',
    '&#8722;': '-',
    '&#215;': '*',
    '&#247;': '/',
    '&#94;': '^',
    '(&#8208;)': '\\neg',
    '&#61;': '=',
    '&#60;': '<',
    '&#8804;': '\\leq',
    '&#62;': '>',
    '&#8805;': '\\geq',
    '&#8800;': '/=',
    '&#40;': '(',
    '&#41;': ')',
    '&#8747;': '\\int()()',
    '&#8730;': '\\sqrt()',
    '&#8721;': '\\sum()()',
    '<sup>r</sup>': '^r',
    '&#176;': '\\deg',
    '<sup>G</sup>': '^G',
    '<sup>T</sup>': '^T',
    '&#8736;': '\\angle',
    '&#9658;': '\\into',
    '10<sup>()</sup>': '*10^()',
    '&#8739;': '\\with',
    '&#10233;': '\\def',
    '⋿': '\\E',
    '&#8518;': '\\diff',
    '&#8519;<sup>()</sup>': '\\e^()',
    '&#8520;': '\\i',
    'ln': '\\ln()',
    '&#8734;': '\\inf'
  }
}

export const DELIMITERS = {
    ',': true,
    '(': true,
    ')': true,
    '[': true,
    ']': true,
    '{': true,
    '}': true,
    '\"': true,
    ';': true,

    '+': true,
    '-': true,
    '*': true,
    '.*': true,
    '/': true,
    './': true,
    '%': true,
    '^': true,
    '.^': true,
    '~': true,
    '!': true,
    '&': true,
    '|': true,
    '^|': true,
    '\'': true,
    '=': true,
    ':': true,
    '?': true,

    '==': true,
    '!=': true,
    '<': true,
    '>': true,
    '<=': true,
    '>=': true,

    '<<': true,
    '>>': true,
    '>>>': true
  };

  // map with all named delimiters
  export const NAMED_DELIMITERS = {
    'mod': true,
    'to': true,
    'in': true,
    'and': true,
    'xor': true,
    'or': true,
    'not': true
  };

// export const functions = {
//   'abs': 'num => MathHandler.abs(num)',
//   'angle': 'ang => MathHandler.angle(ang)',
//   'ans': 'int => MathHandler.ans(int)',
//   'approx': '(value) => MathHandler.  approx(value)',
//   'augment': '(listA, listB) => MathHandler.augment(listA, listB)',
//   '▶Bin': '(value) => MathHandler.▶Bin(value)',
//   'ceiling': '(value) => MathHandler.ceiling(value)',
//   'cFactor': '(expr) => MathHandler.cFactor(expr)',
// Circle	Circle x, y, radius Draws a Circle on the Graph Screen
//   'colDim': '(matrix) => MathHandler.colDim(matrix)',
//   'colNorm': '(matrix) => MathHandler.colNorm(matrix)',
//   'cos': '(value) => MathHandler.cos(value)',
//   'cos-1': '(value) => MathHandler.cos-1(value)',
//   'cosh': '(value) => MathHandler.cosh(value)',
//   'cosh-1': '(value) => MathHandler.cosh-1(value)',
//   'cot': '(value) => MathHandler.cot(value)',
//   'cot-1': '(value) => MathHandler.cot-1(value)',
//   'coth': '(value) => MathHandler.coth(value)',
//   'coth-1': '(value) => MathHandler.coth-1(value)',
//   'crossP': '(vector, vector) => MathHandler.crossP(vector, vector)',
//   'csc': '(value) => MathHandler.csc(value)',
//   'csc-1': '(value) => MathHandler.csc-1(value)',
//   'csch': '(value) => MathHandler.csch(value)',
//   'csch-1': '(value) => MathHandler.csch-1(value)',
//   'cSolve': '(equation, var) => MathHandler.cSolve(equation, var)',
// CubicReg	CubicReg [XListName, YListName, freqlist, regequ] Finds the best fit cubic for a set of data.
//   '▶Cylind': '(vector) => MathHandler.▶Cylind(vector)',
//   'cZeros': '(expr, var) => MathHandler.cZeros(expr, var)',
// Data▶Mat	Converts data into a matrix
//   '▶Dec': '(int) => MathHandler.▶Dec(int)',
// Define	Define var(arg1, ...)=expr Defines a function
// DelVar	DelVar name deletes a variable
//   'det': '(matrix) => MathHandler.det(matrix)',
//   'diag': '(matrix) => MathHandler.diag(matrix)',
//   'dim': '(list) => MathHandler.dim(list)',
// DispG	DispG displays the graph screen
// DispHome	DispHome displays the home screen
// DispTbl	DispTbl displays the table
//   '▶DMS': '(number) => MathHandler.▶DMS(number)',
//   'dotP': '(vector, vector) => MathHandler.dotP(vector, vector)',
// DrawFunc	DrawFunc expr draws a function on the graph screen
// DrawInv	DrawInv expr draws the inverse of a function on the graph screen
// DrawParm	DrawParm expr, expr draws a parametric function on the graph screen
// DrawPol	DrawPol expr draws a polar function on the graph screen
// DrawSlp	DrawSlp x, y, slope draws a line with the given slope that goes through the point (x, y)
// Else	Indicates to take an action if a condition is false.
// ElseIf	Indicates to take an action if an initial condition if false, but this condition is true
// EndFor	Ends a For block
// EndFunc	Ends a Func block
// EndIf	Ends an If:Then block
// EndLoop	Ends a Loop block
// EndPrgm	Ends a Prgm block
// EndTry	Ends a Try block
// EndWhile	Ends a While block
//   'entry': '(int) => MathHandler.entry(int)',
//   'exact': '(expr) => MathHandler.exact(expr)',
// Exit	exits a Loop, While or For block
//   'expand': '(expr) => MathHandler.expand(expr)',
// ExpReg	exponential regression
//   'factor': '(expr) => MathHandler.factor(expr)',
// false	the boolean value false.
//   'floor': '(value) => MathHandler.floor(value)',
//   'fMax': '(expr, var) => MathHandler.fMax(expr, var)',
//   'fMin': '(expr, var) => MathHandler.fMin(expr, var)',
// FnOff	FnOff int turns off the display of a function
// FnOn	FnOn int turns on the display of a function
// For	For Variable, start, end:commands:EndFor initiates a for loop
// Func	Func:commands:EndFunc initiates a function
//   'gcd': '(value, value) => MathHandler.gcd(value, value)',
// getType(	returns the type of the given variable
//   '▶Grad': '(value) => MathHandler.▶Grad(value)',
//   '▶Hex': '(value) => MathHandler.▶Hex(value)',
//   'identity': '(integer) => MathHandler.identity(integer)',
// If	If:command initiates an If statement
//   'impDif': '(equation, var, var, order) => MathHandler.impDif(equation, var, var, order)',
//   'int': '(value) => MathHandler.int(value)',
//   'intDiv': '(value, value) => MathHandler.intDiv(value, value)',
//   'isPrime': '(int) => MathHandler.isPrime(int)',
//   'isVar': '(var) => MathHandler.isVar(var)',
// Lbl	defines a label
//   'lcm': '(value, value) => MathHandler.lcm(value, value)',
//   'left': '(list) => MathHandler.left(list)',
//   'limit': '(expr, var, point) => MathHandler.limit(expr, var, point)',
// Line	Line X1, Y1, X2, Y2 draws a line
// LineHorz	LineHorz Y draws a horizontal line
// LineVert	LineVert X draws a vertical line
// LinReg
//   'ΔList': '(list) => MathHandler.ΔList(list)',
// list▶mat(	list▶mat(list, int) where int is the number of elements per row
//   'ln': '(value) => MathHandler.ln(value)',
//   '▶ln': '(value) => MathHandler.▶ln(value)',
// LnReg	linear regression
//   'log': '(value, base) => MathHandler.log(value, base)',
// ▶logbase(	value▶logbase(base) displays a log as a log of the specific base
// Loop	initiates a loop
// Mat▶Data	converts a matrix into data
//   '▶list': '(Mat) => MathHandler.▶list(Mat)',
//   'max': '(value,value) => MathHandler.max(value,value)',
//   'mean': '(list) => MathHandler.mean(list)',
//   'median': '(list) => MathHandler.median(list)',
//   'min': '(value,value) => MathHandler.min(value,value)',
//   'mod': '(value,divisor) => MathHandler.mod(value,divisor)',
//   'mRow': '(factor,mat,row) => MathHandler.mRow(factor,mat,row)',
//   'mRowAdd': '(factor,mat,row1,row2) => MathHandler.mRowAdd(factor,mat,row1,row2)',
//   'nCr': '(n,r) => MathHandler.nCr(n,r)',
//   'nDeriv': '(expression,variable) => MathHandler.nDeriv(expression,variable)',
//   'newList': '(dim) => MathHandler.newList(dim)',
//   'newMat': '(row,col) => MathHandler.newMat(row,col)',
//   'nInt': '(expr,var,low,high) => MathHandler.nInt(expr,var,low,high)',
// 'norm': '(mat) => MathHandler.norm(mat)',
// not	not value returns the logical or arithmetic not of a value.
//   'nPr': '(n,r) => MathHandler.nPr(n,r)',
// nSolver(
// or	value or value returns the logical or arithmetic or of a value
// Output(	Output(row,col,expr) Outputs the expr to the row and column on the output screen
//   'P▶Rx': '(r,θ) => MathHandler.P▶Rx(r,θ)',
//   'P▶Ry': '(r,θ) => MathHandler.P▶Ry(r,θ)',
// part(
// Pause	Pause pauses program execution until enter is pressed
// PlotsOff	PlotsOff [1][,2][...][,9] turns off display of the specified plots
// PlotsOn	PlotsOn [1][,2][...][,9] turns on display of the specified plots
//   '▶Polar': '(vector) => MathHandler.▶Polar(vector)',
// polyEval(
// PowerReg	power regression
//   '∏': '(expr,var,low,high) => MathHandler.∏(expr,var,low,high)',
//   'product': '(list) => MathHandler.product(list)',
// Prompt	Prompt var prompts for the input of a value
//   'propFrac': '(value) => MathHandler.propFrac(value)',
// QuadReg	quadratic regression
// QuartReg	quartic regression
//   'R▶Pθ': '(x,y) => MathHandler.R▶Pθ(x,y)',
//   'R▶Pr': '(x,y) => MathHandler.R▶Pr(x,y)',
//   '▶Rad': '(value) => MathHandler.▶Rad(value)',
//   'rand': '() => MathHandler.rand()',
//   'randMat': '(row,col) => MathHandler.randMat(row,col)',
//   'randNorm': '(mean,std_dev) => MathHandler.randNorm(mean,std_dev)',
//   'randPoly': '(var,order) => MathHandler.randPoly(var,order)',
//   'RandSeed': '(value) => MathHandler.RandSeed(value)',
//   'real': '(value) => MathHandler.real(value)',
//   '▶Rect': '(vector) => MathHandler.▶Rect(vector)',
//   'remain': '(value,divisor) => MathHandler.remain(value,divisor)',
//   'Rename': '(old, new) => MathHandler.Rename(old, new)',
// Return	returns from a function or program
//   'right': '(list) => MathHandler.right(list)',
//   'root': '(value,value) => MathHandler.root(value,value)',
//   'rotate': '(list,int) => MathHandler.rotate(list,int)',
//   'round': '(value,digits) => MathHandler.round(value,digits)',
//   'rowAdd': '(mat,row1,row2) => MathHandler.rowAdd(mat,row1,row2)',
//   'rowDim': '(mat) => MathHandler.rowDim(mat)',
//   'rowSwap': '(mat,row1,row2) => MathHandler.rowSwap(mat,row1,row2)',
//   'sec': '(value) => MathHandler.sec(value)',
//   'sec-1': '(value) => MathHandler.sec-1(value)',
//   'sech': '(value) => MathHandler.sech(value)',
//   'sech-1': '(value) => MathHandler.sech-1(value)',
//   'seq': '(expr,var,low,high) => MathHandler.seq(expr,var,low,high)',
//   'Shade': '(expr1, expr2) => MathHandler.Shade(expr1, expr2)',
//   'shift': '(list,int) => MathHandler.shift(list,int)',
//   'sign': '(value) => MathHandler.sign(value)',
//   'sin': '(value) => MathHandler.sin(value)',
//   'sin-1': '(value) => MathHandler.sin-1(value)',
//   'sinh': '(value) => MathHandler.sinh(value)',
//   'sinh-1': '(value) => MathHandler.sinh-1(value)',
// SinReg	sin regression
//   'solve': '(equation,var) => MathHandler.solve(equation,var)',
//   'SortA': '(list) => MathHandler.SortA(list)',
//   'SortD': '(list) => MathHandler.SortD(list)',
//   '▶Sphere': '(vector) => MathHandler.▶Sphere(vector)',
//   'stdDev': '(list) => MathHandler.stdDev(list)',
//   'subMat': '(mat,r1,c1,r2,c2) => MathHandler.subMat(mat,r1,c1,r2,c2)',
//   'sum': '(list) => MathHandler.sum(list)',
//   '∑': '(expr,var,low,high) => MathHandler.∑(expr,var,low,high)',
// T	matrixT returns the transposed matrix
//   'tan': '(value) => MathHandler.tan(value)',
//   'tan-1': '(value) => MathHandler.tan-1(value)',
//   'tanh': '(value) => MathHandler.tanh(value)',
//   'tanh-1': '(value) => MathHandler.tanh-1(value)',
//   'taylor': '(expr,var,order,point) => MathHandler.taylor(expr,var,order,point)',
// Then	If:condition:Then:commands:End initiates an If/Then statement
//   'tmpCnv': '(temp) => MathHandler.tmpCnv(temp)',
//   'ΔtmpCnv': '(tDiff) => MathHandler.ΔtmpCnv(tDiff)',
//   'unitV': '(vector) => MathHandler.unitV(vector)',
//   'variance': '(list) => MathHandler.variance(list)',
//   'when': '(expr,ifTrue,ifFalse) => MathHandler.when(expr,ifTrue,ifFalse)',
// While	initiates a While loop
// xor	value xor value performs an xor on two values.
//   'zeros': '(expr,var) => MathHandler.zeros(expr,var)',
//
// +	addition
// -	subtraction
// *	multiplication
// /	division
// ^	exponentiation
// .+	decimal addition
// .-	decimal subtraction
// .*	decimal multiplication
// ./	decimal division
// .^	decimal exponentiation
// ﹘	negative
// %	percent
// =	equivalence
// ≠	unequivalence
// <	less than
// ≤	less than or equal to
// >	greater than
// ≥	greater than or equal to
//   '!': '(value) => MathHandler.!(value)',
//   '∫': '(expression,var) => MathHandler.∫(expression,var)',
//   '√': '(value) => MathHandler.√(value)',
// 'r'	valuer changes value to radians
// '˚'	value˚ changes value to degrees
// 'G'	valueG changes value to gradians
// '∠'
// ▶︎	used in composing other command names or converting units
// |	expression|var=value evaluates the expression with the variable set to a value (with operator)
// →	value→var variable assignment
// ⋿	engineering notation
//   '𝑑': '(expression, var) => MathHandler.𝑑(expression, var)',
// listn[	listn[value] returns the data point from the nth list at entry value
// datan[	datan[value] returns the list from the nth data set at entry value
// matn[	matn[value1,value2] returns the value1th element from the value2th row from matrix n
// }
