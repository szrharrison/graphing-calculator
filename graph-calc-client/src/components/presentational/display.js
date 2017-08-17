import React, { Component } from 'react'
import { connect } from 'react-redux'

class Display extends Component {
  MathJax = null
  calcDisplay = null

  componentDidMount = () => {
    if(window.MathJax) {
      this.MathJax = window.MathJax
      this.MathJax.Hub.queue.Push(['Typeset', this.MathJax.Hub, 'calculator-display'])
      this.calcDisplay = this.MathJax.Hub.getAllJax('calculator-display')[0]
    }
  }

  componentDidUpdate = () => {
    if(this.MathJax) {
      this.MathJax.Hub.queue.Push(['Reprocess', this.calcDisplay])
    } else if (window.MathJax) {
      this.MathJax = window.MathJax
      this.MathJax.Hub.queue.Push(['Typeset', this.MathJax.Hub, 'calculator-display'])
      this.calcDisplay = this.MathJax.Hub.getAllJax('calculator-display')[0]
      this.MathJax.Hub.queue.Push(['Reprocess', this.calcDisplay])
    }
  }

  render() {
    return (
      <div id='calculator-display'>
        <script type='math/tex; mode=display'>
          {this.props.expression}
        </script>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  expression: state.evaluate.expression
})

export default connect(mapStateToProps)(Display)
