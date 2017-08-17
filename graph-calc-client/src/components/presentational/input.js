import React, { Component } from 'react'
import { connect } from 'react-redux'

import { updateUserInput, updateUserKeys } from '../../actions/input'
import { setExpression } from '../../actions/evaluate'

class Input extends Component {

  handleKeyDown = event => {
    const notCommandKey = event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta'
    if(event.key === 'Enter') {
      this.props.setExpression(event.target.value)
    } else if (notCommandKey) {
      const keys = {
        Alt: event.altKey,
        Control: event.ctrlKey,
        Shift: event.shiftKey,
        Meta: event.metaKey
      }
      this.props.updateUserKeys(event.key, keys)
    }
  }
  handleChange = event => {
    this.props.updateUserInput(event.target.value)
  }

  render() {
    return (
      <input
        id='calculator-input'
        onKeyDown={this.handleKeyDown}
        onChange={this.handleChange}
        value={this.props.inputString}
      />
    )
  }
}

const mapStateToProps = state => ({
  inputString: state.input.inputString
})

export default connect(mapStateToProps, {
  updateUserInput,
  updateUserKeys,
  setExpression
})(Input)
