import _ from 'lodash'

export const updateUserInput = inputString => {
  return {
    type: 'UPDATE_USER_INPUT',
    inputString
  }
}

export const updateUserKeys = (inputKey, keys) => {
  const usedKeys = _.keys(_.pickBy( keys, val => val ))
  return {
    type: 'UPDATE_USER_KEYS',
    inputKey: [inputKey, ...usedKeys]
  }
}
