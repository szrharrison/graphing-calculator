import { typed } from '../../../types'
import Matrix from '../Matrix'

/**
 * Create a new Matrix with given storage format
 * @param {Array} data
 * @param {string} [format]
 * @param {string} [datatype]
 * @returns {Matrix} Returns a new Matrix
 * @private
 */
const _create = (data, format, datatype) => {
  // get storage format constructor
  const M = Matrix.storage(format || 'default')

  // create instance
  return new M(data, datatype)
}

/**
 * Create a Matrix. The function creates a new `math.type.Matrix` object from
 * an `Array`. A Matrix has utility functions to manipulate the data in the
 * matrix, like getting the size and getting or setting values in the matrix.
 * Supported storage formats are 'dense' and 'sparse'.
 *
 * Syntax:
 *
 *    math.matrix()                         // creates an empty matrix using default storage format (dense).
 *    math.matrix(data)                     // creates a matrix with initial data using default storage format (dense).
 *    math.matrix('dense')                  // creates an empty matrix using the given storage format.
 *    math.matrix(data, 'dense')            // creates a matrix with initial data using the given storage format.
 *    math.matrix(data, 'sparse')           // creates a sparse matrix with initial data.
 *    math.matrix(data, 'sparse', 'number') // creates a sparse matrix with initial data, number data type.
 *
 * Example:
 *
 *    var m = math.matrix([[1, 2], [3, 4]]);
 *    m.size();                        // Array [2, 2]
 *    m.resize([3, 2], 5);
 *    m.valueOf();                     // Array [[1, 2], [3, 4], [5, 5]]
 *    m.get([1, 0])                    // number 3
 *
 * @param {Array | Matrix} [data]    A multi dimensional array
 * @param {string} [format]          The Matrix storage format
 *
 * @return {Matrix} The created matrix
 */
const matrix = typed('matrix', {
  '': () => _create([]),
  'string': format => _create([], format),
  'string, string': (format, datatype) => _create([], format, datatype),
  'Array': data => _create(data),
  'Matrix': data => _create(data, data.storage()),
  'Array | Matrix, string': _create,
  'Array | Matrix, string, string': _create
})

matrix.toTex = {
  0: '\\begin{bmatrix}\\end{bmatrix}',
  1: '\\left(${args[0]}\\right)',       // eslint-disable-line
  2: '\\left(${args[0]}\\right)'        // eslint-disable-line
}

export default matrix
