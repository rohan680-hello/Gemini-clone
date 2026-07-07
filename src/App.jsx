import React, { useContext, useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/main/Main'
import { Context } from './context/Context'

const App = () => {
  const { userName, login } = useContext(Context)
  const [name, setName] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    login(name)
  }

  if (!userName) {
    return (
      <div className="login-page">
        <form onSubmit={handleSubmit} className="login-box">
          <p className="login-brand">Gemini</p>
          <h1>Welcome back</h1>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="Enter your name"
            autoFocus
          />
          <button type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <Main />
    </>
  )
}

export default App
