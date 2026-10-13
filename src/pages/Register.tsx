import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
    const [message, setMessage] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const res = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        setMessage(data.message)

        if (res.ok) {
            navigate('/login')
        } else {
            setMessage(data.message)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Register</h2>
                    <Link to="/login" className="text-sm underline">Log in</Link>
                </div>
                <p className="text-sm opacity-60 mb-2">Create a profile</p>

                <label className="label">Username</label>
                <input type="text" className="input w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}/>

                <label className="label">Password</label>
                <input type="password" className="input w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
                <p>{message}</p>
                <button className="btn btn-neutral w-full mt-4">Register</button>
            </fieldset>
        </form>
    )
}
