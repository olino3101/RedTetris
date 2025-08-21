import { useState } from 'react'
import './App.css'
import Game from "/src/components/Game";

function App() {

  return (
    <div className="App">
      <Game rows={20} columns={10}></Game>
    </div>
  )
}

export default App
