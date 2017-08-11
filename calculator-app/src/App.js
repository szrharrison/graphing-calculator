import React, { Component } from 'react';
import Screen from './Screen'
import NumberButtons from './NumberButtons'
import './App.css';

class App extends Component {
  constructor(){
    super()

    this.state = {
      equation: []
    }
  }

  renderEquation(){
    var equation = this.state.equation
  }

  render() {
    return (
      <div className="App">
          <h2>Welcome to TI-89 Titanium</h2>
          <NumberButtons />
      </div>
    );
  }
}

export default App;
