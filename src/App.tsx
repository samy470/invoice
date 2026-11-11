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
  const [username, setUsername] = useState(localStorage.getItem('username') ?? '')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [s, setS] = useState({ currency: "DZD", taxRate: 19, ...JSON.parse(localStorage.getItem("settings") || "{}") })

  return (
    <BrowserRouter>     
        <Routes>
          <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} username={username} setUsername={setUsername} />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/' element={<Sidebar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} username={username} setUsername={setUsername} s={s} setS={setS}/>}>
            <Route index element={<Home s={s}/>}/>
            <Route path='/clients' element={<Clients s={s}/>}/>
            <Route path='/invoices' element={<Invoices s={s} />}/>
            <Route path='/profile' element={<Profile/>}/>
          </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
