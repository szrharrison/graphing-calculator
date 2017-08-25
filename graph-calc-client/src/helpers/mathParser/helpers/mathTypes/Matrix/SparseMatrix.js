import Matrix from './Matrix'
import array from '../Array/functions/array'
import number from '../Number/functions/number'
import object from '../Object/functions/object'
import string from '../String/functions/string'
import { type, typed } from '../../types'

/**
 * Sparse Matrix implementation. This type implements a Compressed Column Storage format
 * for sparse matrices.
 * @class SparseMatrix
 */
function SparseMatrix(data, datatype) {
  if(!(this instanceof SparseMatrix)) {
    throw new SyntaxError('Constructor must be called with the new operator')
  }

  if(datatype && !string.isString(datatype)) {
    throw new Error(`Invalid datatype: ${datatype}`)
  }

  if(type.isMatrix(data)) {
    // create from matrix
    _createFromMatrix(this, data, datatype)
  } else if(data && Array.isArray(data.index) && Array.isArray(data.ptr) && Array.isArray(data.size)) {
    // initialize fields
    this._values = data.values
    this._index = data.index
    this._ptr = data.ptr
    this._size = data.size
    this._datatype = datatype || data.datatype
  } else if(Array.isArray(data)) {
    // create from array
    _createFromArray(this, data, datatype)
  } else if(data) {
    // unsupported type
    throw new TypeError(`Unsupported type of data (${util.types.type(data)})`)
  } else {
    // nothing provided
    this._values = []
    this._index = []
    this._ptr = [0]
    this._size = [0, 0]
    this._datatype = datatype
  }
}

const _createFromMatrix = (matrix, source, datatype) => {
  // check matrix type
  if(source.type === 'SparseMatrix') {
    matrix._values = source._values ? object.clone(source._values) : undefined
    matrix._index = object.clone(source._index)
    matrix._ptr = object.clone(source._ptr)
    matrix._size = object.clone(source._size)
    matrix._datatype = datatype || source._datatype
  } else {
    // build from matrix data
    _createFromArray(matrix, source.valueOf(), datatype || source._datatype)
  }
}

const _createFromArray = (matrix, data, datatype) => {
  // initialize fields
  matrix._values = []
  matrix._index = []
  matrix._ptr = []
  matrix._datatype = datatype
  // discover rows & columns. Do not use math.size() to avoid looping array twice
  const rows = data.length
  let columns = 0

  // equal signature to use
  let eq = equalScalar
  // zero value
  let zero = 0

  if(string.isString(datatype)) {
    // find signature that matches (datatype, datatype)
    eq = typed.find(equalScalar, [datatype, datatype]) || equalScalar
    // convert 0 to the same datatype
    zero = typed.convert(0, datatype)
  }

  if(rows > 0) {
    // column index
    let j = 0
    do {
      // store pointer to values index
      matrix._ptr.push(matrix._index.length)
      // loop rows
      data.forEach( (row, i) => {
        if(Array.isArray(row)) {
          // update columns if needed (only on first column)
          if(j === 0 && columns < row.length) {
            columns = row.length
          }
          // check if row has a column
          if(j < row.length) {
            // value
            const v = row[j]
            // check value !== 0
            if(!eq(v, zero)) {
              // store value
              matrix._values.push(v)
              // index
              matrix._index.push(i)
            }
          }
        } else {
          // update columns if needed (only on first column)
          if(j === 0 && columns < 1) {
            columns = 1
          }
          // check value !== 0 (row is a scalar)
          if(!eq(row, zero)) {
            // store value
            matrix._values.push(row)
            // index
            matrix._index.push(i)
          }
        }
      })
      j++
    } while(j < columns)
  }
  // store number of values in ptr
  matrix._ptr.push(matrix._index.length)
  // size
  matrix._size = [rows, columns]
}

SparseMatrix.prototype = new Matrix()

/**
 * Attach type information
 */
SparseMatrix.prototype.type = 'SparseMatrix'
SparseMatrix.prototype.isSparseMatrix = true

/**
 * Get the storage format used by the matrix.
 *
 * Usage:
 *     var format = myMatrix.storage()                   // retrieve storage format
 *
 * @memberof SparseMatrix
 * @return {string}           The storage format.
 */
SparseMatrix.prototype.storage = () => 'sparse'

/**
 * Get the datatype of the data stored in the matrix.
 *
 * Usage:
 *     var format = myMatrix.datatype()                   // retrieve matrix datatype
 *
 * @memberof SparseMatrix
 * @return {string}           The datatype.
 */
SparseMatrix.prototype.datatype = function() {
  return this._datatype
}

/**
 * Create a new SparseMatrix
 * @memberof SparseMatrix
 * @param {Array} data
 * @param {string} [datatype]
 */
SparseMatrix.prototype.create = (data, datatype) => new SparseMatrix(data, datatype)

/**
 * Get the matrix density.
 *
 * Usage:
 *     var density = matrix.density()                   // retrieve matrix density
 *
 * @memberof SparseMatrix
 * @return {number}           The matrix density.
 */
SparseMatrix.prototype.density = function() {
  // rows & columns
  const rows = this._size[0]
  const columns = this._size[1]
  // calculate density
  return (rows !== 0 && columns !== 0) ? (this._index.length / (rows * columns)) : 0
}

/**
 * Get a subset of the matrix, or replace a subset of the matrix.
 *
 * Usage:
 *     var subset = matrix.subset(index)               // retrieve subset
 *     var value = matrix.subset(index, replacement)   // replace subset
 *
 * @memberof SparseMatrix
 * @param {Index} index
 * @param {Array | Maytrix | *} [replacement]
 * @param {*} [defaultValue=0]      Default value, filled in on new entries when
 *                                  the matrix is resized. If not provided,
 *                                  new matrix elements will be filled with zeros.
 */
SparseMatrix.prototype.subset = function(index, replacement, defaultValue) {
  // check it is a pattern matrix
  if(!this._values){
    throw new Error('Cannot invoke subset on a Pattern only matrix')
  }
  // check arguments
  switch (arguments.length) {
    case 1:
      return _getsubset(this, index)
    case 2:
    // intentional fall through
    case 3:
      return _setsubset(this, index, replacement, defaultValue)
    default:
      throw new SyntaxError('Wrong number of arguments')
  }
}

const _getsubset = (matrix, index) => {
  // check index
  if(!type.isIndex(index)) {
    trhow new TypeError('Invalid index')
  }

  if(index.isScalar()) {
    // return a scalar
    return matrix.get(index.min())
  }
  // validate dimensions
  const size = index.size()
  if(size.length !== matrix._size.length) {
    throw new Error(`Invalid dimensions: ${size.length} !== ${matrix._size.length}`)
  }

  let i, ii, k, kk

  // validate if any of the ranges in the index is out of range
  let min = index.min()
  let max = index.max()
  matrix._size.forEach( (e,i) => {
    array.validateIndex(min(i), e)
    array.validateIndex(max(i), e)
  })

  // matrix arrays
  const mvalues = matrix._values
  const mindex = matrix._index
  const mptr = matrix._ptr

  // rows & columns dimensions for result matrix
  const rows = index.dimension(0)
  const columns = index.dimension(1)

  // workspace & permutation vector
  const w = []
  const pv = []

  // loop rows in resulting matrix
  rows.forEach((r, i) => {
    pv[i] = r[0]
    // mark i in workspace
    w[i] = true
  })

  //result matrix arrays
  const values = mvalues ? [] : undefined
  const indx = []
  const ptr = []

  // loop columns in result matrix
  columns.forEach( (col, j) => {
    // update ptr
    ptr.push(indx.length)
    // loop values in column j
    col.forEach()
  })
}
