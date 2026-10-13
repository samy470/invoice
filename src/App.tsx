import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './App.css'
import Home from './pages/Home'
import Clients from './pages/Clients'
import Invoices from './pages/Invoices'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profil'

function App() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <BrowserRouter>
      <Sidebar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} username={username} setUsername={setUsername}>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path='/clients' element={<Clients />}></Route>
          <Route path='/invoices' element={<Invoices />}></Route>
          <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} username={username} setUsername={setUsername} />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/profile' element={<Profile/>}></Route>
        </Routes>
      </Sidebar>
    </BrowserRouter>
  )
}

export default App
