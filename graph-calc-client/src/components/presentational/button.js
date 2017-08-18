import React from 'react'
import { connect } from 'react-redux'

import { addToUserInput } from '../../actions/input'

const InputButton = props => (
    <div
      className='input-button'
      dangerouslySetInnerHTML={{__html: props.symbol}}
      onClick={ e => props.addToUserInput(props.inputString) }
    />
)

const mapStateToProps = state => ({})

export default connect(mapStateToProps, {addToUserInput})(InputButton)
