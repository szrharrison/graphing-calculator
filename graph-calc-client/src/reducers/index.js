import { combineReducers } from 'redux'

import input from './inputReducers'
import evaluate from './evaluateReducers'

const rootReducer = combineReducers({
  input,
  evaluate
})

export default rootReducer
