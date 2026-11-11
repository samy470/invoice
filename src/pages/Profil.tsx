import { useState, useEffect } from "react"

type Profile = {
    businessName: string
    activity: string
    address: string
    phone: string
    email: string
    rc: string
    taxId: string
    statId: string
    rib: string
}

const empty: Profile = {
    businessName: "", activity: "", address: "", phone: "", email: "",
    rc: "", taxId: "", statId: "", rib: "",
}

const fields: { key: keyof Profile; label: string }[] = [
    { key: "businessName", label: "Business name" },
    { key: "activity", label: "Activity" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "rc", label: "RC" },
    { key: "taxId", label: "NIF" },
    { key: "statId", label: "NIS" },
    { key: "rib", label: "RIB" },
]

export default function BusinessProfile() {
    const [form, setForm] = useState<Profile>(empty)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/getProfile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => setForm({ ...empty, ...data }))
            .catch(() => setError("Could not load the profile"))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/saveProfile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error()

            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch {
            setError("Could not save the profile")
        }
    }

    return (
        <div className="p-6 max-w-3xl">
            <form onSubmit={handleSave} className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold">Business profile</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(f => (
                        <label key={f.key} className="flex flex-col gap-1">
                            <span className="text-sm opacity-60">{f.label}</span>
                            <input
                                className="input input-bordered w-full"
                                value={form[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                required={f.key === "businessName"}
                            />
                        </label>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button type="submit" className="btn btn-primary">Save</button>
                    {saved && <span className="text-success text-sm">Saved</span>}
                    {error && <span className="text-error text-sm">{error}</span>}
                </div>
            </form>
        </div>
    )
}
