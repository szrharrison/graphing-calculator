import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import Button from './button'
import { symbols } from '../../helpers/constants'

import './presentational.css'

const InputButtons = props => {
  const buttons = []
  _.forIn(symbols, (buttonList, mode) => {
    if(mode === props.buttonMode) {
      _.forIn(buttonList, (inputString, html) => {
        buttons.push(
          <Button
            key={ _.uniqueId('button') }
            symbol={ html }
            inputString={ inputString }
          />
        )
      })
    }
  })

  return (
    <div>
      { buttons }
    </div>
  )
}

const mapStateToProps = state => ({
  buttonMode: state.input.buttonMode
})
export default connect(mapStateToProps)(InputButtons)
