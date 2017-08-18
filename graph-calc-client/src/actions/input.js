import _ from 'lodash'

export const updateUserInput = inputString => ({
  type: 'UPDATE_USER_INPUT',
  inputString
})

export const addToUserInput = addString => ({
  type: 'ADD_TO_USER_INPUT',
  addString
})

export const updateUserKeys = (inputKey, keys) => {
  const usedKeys = _.keys(_.pickBy( keys, val => val ))
  return {
    type: 'UPDATE_USER_KEYS',
    inputKey: [inputKey, ...usedKeys]
  }
}

export const changeButtons = buttonMode => ({
  type: 'CHANGE_BUTTONS',
  buttonMode
})
