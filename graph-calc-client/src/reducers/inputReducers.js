import createReducer from './helpers'

const initialState = {
  inputString: '',
  inputKeys: [],
  buttonMode: 'general'
}

const updateUserInput = (state, action) => ({
  ...state,
  inputString: action.inputString
})

const addToUserInput = (state, action) => ({
  ...state,
  inputString: `${state.inputString}${action.addString}`
})

const updateUserKeys = (state, action) => ({
  ...state,
  inputKeys: [...state.inputKeys, action.inputKey]
})

const setExpression = state => ({
  ...state,
  inputString: '',
  inputKeys: []
})

const changeButtons = (state, action) => ({
  ...state,
  buttonMode: action.buttonMode
})

const input = createReducer(initialState, {
  UPDATE_USER_INPUT: updateUserInput,
  ADD_TO_USER_INPUT: addToUserInput,
  UPDATE_USER_KEYS: updateUserKeys,
  SET_EXPRESSION: setExpression,
  CHANGE_BUTTONS: changeButtons
})

export default input
