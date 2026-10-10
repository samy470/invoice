import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './App.css'
import Home from './pages/Home'
import Clients from './pages/Clients'
import Invoices from './pages/Invoices'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Sidebar />}>
          <Route index element={<Home />}></Route>
          <Route path='/clients' element={<Clients />}></Route>
          <Route path='/invoices' element={<Invoices />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
