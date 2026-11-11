import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Login({ setIsLoggedIn, username, setUsername }: { setIsLoggedIn: (value: boolean) => void, username: string, setUsername: (value: string) => void }) {
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      navigate('/')
      setIsLoggedIn(true)
    } else {
      setMessage(data.error)
    }
  }

  return (
    <div className = "flex justify-center items-center min-h-screen">
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Login</h2>
          <Link to="/register" className="text-sm underline">Register</Link>
        </div>
        <p className="text-sm opacity-60 mb-2">Login to your profile</p>

        <label className="label">Username</label>
        <input type="text" className="input w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />

        <label className="label">Password</label>
        <input type="password" className="input w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <p>{message}</p>
        <button className="btn btn-neutral w-full mt-4">Login</button>
      </fieldset>
    </form>
    </div >
  )
}
