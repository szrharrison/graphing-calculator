import _ from 'lodash'

import matchNested from './matchNested'

class ParseMath {

  splitOrdOp = input => {
    const operations = matchNested(input, '(...)')
    if( operations.length === 0 ) {
      return input
    } else {
      console.log(operations)
      return operations.map( operation => this.splitOrdOp(operation) )
    }
  }

  splitMath = input => {

  }
}

export default ParseMath
