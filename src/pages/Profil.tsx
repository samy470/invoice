import { useState, useEffect } from "react"

const API = 'https://invoice-back-zcg0.onrender.com'

type Profile = {
    businessName: string
    address: string
    phone: string
    nif: string
    nis: string
}

const empty: Profile = { businessName: "", address: "", phone: "", nif: "", nis: "" }

export default function Profile() {
    const [form, setForm] = useState<Profile>(empty)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetch(`${API}/getProfile`)
            .then(res => res.json())
            .then(data => setForm({ ...empty, ...data }))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        await fetch(`${API}/saveProfile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="p-6 max-w-xl">
            <form onSubmit={handleSave} className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold">Business profile</h2>

                <input
                    className="input input-bordered w-full"
                    placeholder="Business name"
                    value={form.businessName}
                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                    required
                />
                <input
                    className="input input-bordered w-full"
                    placeholder="Address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                />
                <input
                    className="input input-bordered w-full"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                <input
                    className="input input-bordered w-full"
                    placeholder="NIF"
                    value={form.nif}
                    onChange={e => setForm({ ...form, nif: e.target.value })}
                />
                <input
                    className="input input-bordered w-full"
                    placeholder="NIS"
                    value={form.nis}
                    onChange={e => setForm({ ...form, nis: e.target.value })}
                />

                <div className="flex items-center gap-3">
                    <button type="submit" className="btn btn-primary">Save</button>
                    {saved && <span className="text-success text-sm">Saved</span>}
                </div>
            </form>
        </div>
    )
}
