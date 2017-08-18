import Token from './Token'

function tokenize(input) {
  const tokenized = []
  const oldInput = input
  input.replace(/</g, '\lt').replace(/>/g, '\gt')
  input.replace(/(\\.+?)(\s|\()/g, '<f>$1</f>$2')
  input.replace(/(\d+)(\D)/g, '<n>$1</n>$2')
}
