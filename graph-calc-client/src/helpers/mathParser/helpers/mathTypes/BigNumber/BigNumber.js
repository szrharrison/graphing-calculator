// import Decimal from '../Decimal'

const BigNumber = Decimal.clone({precision: config.precision})

/**
 * Attach type information
 */
BigNumber.prototype.type = 'BigNumber'
BigNumber.prototype.isBigNumber = true

/**
 * Get a JSON representation of a BigNumber containing
 * type information
 * @returns {Object} Returns a JSON object structured as:
 *                   `{"mathjs": "BigNumber", "value": "0.2"}`
 */
BigNumber.prototype.toJSON = function() {
  return {
    mathjs: 'BigNumber',
    value: this.toString()
  }
}

/**
 * Instantiate a BigNumber from a JSON object
 * @param {Object} json  a JSON object structured as:
 *                       `{"mathjs": "BigNumber", "value": "0.2"}`
 * @return {BigNumber}
 */
BigNumber.fromJSON = json => new BigNumber(json.value)
