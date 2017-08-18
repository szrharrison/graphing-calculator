import React from 'react';
import './App.css';

import Input from './components/presentational/input'
import Display from './components/presentational/display'
import InputButtons from './components/presentational/inputButtons'

const App = props => {
  return (
    <div className="App">
      <div className="App-header">
        <h2>Welcome to Graphing Calculator</h2>
      </div>
      <Display />
      <Input />
      <InputButtons />
    </div>
  )
}

export default App
