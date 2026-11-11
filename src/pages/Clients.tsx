import { useState, useEffect } from "react"
type Client = {
    id: number
    name: string
    phone?: string
    email: string
    taxId?: string
    statId?: string
    rc?: string
    owed: number
}

type ClientForm = {
    name: string
    email: string
    phone: string
    taxId: string
    statId: string
    rc: string
}

const emptyForm: ClientForm = { name: "", email: "", phone: "", taxId: "", statId: "", rc: "" }

export default function Clients({ s }: { s: { currency: string; taxRate: number } }) {
    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency: s.currency }).format(n)

    const [users, setUsers] = useState<Client[]>([])
    const [selected, setSelected] = useState<Client | null>(null)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ClientForm>(emptyForm)

    const filtered = users.filter(u =>
        (u.name + " " + u.email).toLowerCase().includes(search.toLowerCase())
    )

    const fetchUsers = () =>
    fetch(`${import.meta.env.VITE_API_URL}/getUsers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
        .then(res => res.json())
        .then(data => setUsers(data))

useEffect(() => {
    fetchUsers()
}, [])

    const openAdd = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormOpen(true)
    }

    const openEdit = (c: Client) => {
        setSelected(null)
        setEditingId(c.id)
        setForm({
            name: c.name,
            email: c.email,
            phone: c.phone ?? "",
            taxId: c.taxId ?? "",
            statId: c.statId ?? "",
            rc: c.rc ?? ""          
        })
        setFormOpen(true)
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditingId(null)
        setForm(emptyForm)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return

        if (editingId !== null) {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/updateUsers`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify( {...form, id: editingId} )
        })
        const data = await res.json()
        alert(data.message)
        }else {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/addUsers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify( form )
        })
        const data = await res.json()
        alert(data.message)
        }
        await fetchUsers()
        closeForm()
    }

    const handleDelete = async (c: Client) => {
        if (!window.confirm(`Delete ${c.name}?`)) return
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/deleteUsers`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}`},
            body: JSON.stringify({ id: c.id })
        })
        const data = await res.json()
        alert(data.message)
        await fetchUsers()
    }

    return (
        <div className="p-6">
            {/* top bar */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    className="input input-bordered w-72"
                    placeholder="Search clients"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAdd}>
                    Add client
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Tax Id</th>
                            <th>Stat Id</th>
                            <th>rc</th>
                            <th>Owed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center opacity-50">
                                    No clients yet
                                </td>
                            </tr>
                        )}
                        {filtered.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="font-bold">{u.name}</div>
                                            <div className="text-sm opacity-50">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {u.phone ?? "-"}
                                </td>
                                <td>
                                    {u.taxId ?? "-"}
                                </td>
                                <td>
                                    {u.statId ?? "-"}
                                </td>
                                <td>
                                    {u.rc ?? "-"}
                                </td>

                                <td>
                                    <span className={`badge ${u.owed > 0 ? "badge-warning" : "badge-ghost"}`}>
                                        {fmt(u.owed)}
                                    </span>
                                </td>
                                <th>
                                    <div className="flex gap-1">
                                        <button className="btn btn-ghost btn-xs" onClick={() => setSelected(u)}>
                                            details
                                        </button>
                                        <button className="btn btn-ghost btn-xs" onClick={() => openEdit(u)}>
                                            edit
                                        </button>
                                        <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(u)}>
                                            delete
                                        </button>
                                    </div>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* details modal */}
            {selected && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-2xl font-bold">{selected.name}</h3>
                        <ul className="mt-4 flex flex-col gap-2 text-sm">
                            <li><span className="opacity-50">Email:</span> {selected.email || "-"}</li>
                            <li><span className="opacity-50">Phone:</span> {selected.phone ?? "-"}</li>
                            <li><span className="opacity-50">Tax ID:</span> {selected.taxId ?? "-"}</li>
                            <li>
                                <span className="opacity-50">Owed:</span>{" "}
                                <span className={`badge ${selected.owed > 0 ? "badge-warning" : "badge-ghost"}`}>
                                    {fmt(selected.owed)}
                                </span>
                            </li>
                        </ul>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setSelected(null)} />
                </div>
            )}

            {/* add / edit modal */}
            {formOpen && (
                <div className="modal modal-open">
                    <form className="modal-box flex flex-col gap-3" onSubmit={handleSave}>
                        <h3 className="text-2xl font-bold">
                            {editingId !== null ? "Edit client" : "Add client"}
                        </h3>

                        <input
                            className="input input-bordered w-full"
                            placeholder="Name *"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <input
                            className="input input-bordered w-full"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                        <input
                            className="input input-bordered w-full"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                        <input
                            className="input input-bordered w-full"
                            placeholder="Tax ID (optional)"
                            value={form.taxId}
                            onChange={e => setForm({ ...form, taxId: e.target.value })}
                        />
                        <input
                            className="input input-bordered w-full"
                            placeholder="rc(optional)"
                            value={form.rc}
                            onChange={e => setForm({ ...form, rc: e.target.value })}
                        />

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={closeForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </form>
                    <div className="modal-backdrop" onClick={closeForm} />
                </div>
            )}
        </div>
    )
}
