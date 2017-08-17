import createReducer from './helpers'

const initialState = {
  expression: ''
}

const setExpression = (state, action) => {
  return {
    ...state,
    expression: action.expression
  }
}

const evaluate = createReducer(initialState, {
  'SET_EXPRESSION': setExpression
})

export default evaluate
