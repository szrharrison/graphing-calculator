import createReducer from './helpers'

const initialState = {
  inputString: '',
  inputKeys: []
}

const updateUserInput = (state, action) => {
  return {
    ...state,
    inputString: action.inputString
  }
}

const updateUserKeys = (state, action) => {
  return {
    ...state,
    inputKeys: [...state.inputKeys, action.inputKey]
  }
}

const setExpression = state => {
  return {
    ...state,
    inputString: '',
    inputKeys: []
  }
}

const input = createReducer(initialState, {
  UPDATE_USER_INPUT: updateUserInput,
  UPDATE_USER_KEYS: updateUserKeys,
  SET_EXPRESSION: setExpression
})

export default input
