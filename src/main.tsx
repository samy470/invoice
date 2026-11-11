import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
const originalFetch = window.fetch

window.fetch = async (...args) => {
    const res = await originalFetch(...args)
    const url = String(args[0])

    if (res.status === 401 && !url.includes('/login') && !url.includes('/register')) {
      console.log(await res.clone().json())
        localStorage.removeItem('token')
        window.location.href = '/login'
    }
    return res
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
