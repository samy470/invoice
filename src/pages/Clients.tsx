import { useState, useEffect } from "react"

type Client = {
    id: number
    name: string
    phone?: string
    email: string
    taxId?: string
    statId?: string
    owed: number
}

type ClientForm = {
    name: string
    email: string
    phone: string
    taxId: string
    statId: string
}

const emptyForm: ClientForm = { name: "", email: "", phone: "", taxId: "", statId: "" }

export default function Clients() {
    const [users, setUsers] = useState<Client[]>([])
    const [selected, setSelected] = useState<Client | null>(null)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ClientForm>(emptyForm)

    const filtered = users.filter(u =>
        (u.name + " " + u.email).toLowerCase().includes(search.toLowerCase())
    )

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
            statId: c.statId ?? ""
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
            const res = await fetch('http://localhost:8000/updateUsers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {...form, id: editingId} )
        })
        const data = await res.json()
        alert(data.message)
        }else {
            const res = await fetch('http://localhost:8000/addUsers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( form )
        })
        const data = await res.json()
        alert(data.message)
        }
        closeForm()
    }

    const handleDelete = async (c: Client) => {
        if (!window.confirm(`Delete ${c.name}?`)) return
        
        const res = await fetch('http://localhost:8000/deleteUsers', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: c.id })
        })
        const data = await res.json()
        alert(data.message)
    }

    useEffect(() => {
        fetch('http://localhost:8000/getUsers').then(res => res.json()).then(data => setUsers(data))
    }, [handleSave])

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
                            <th>
                                <label>
                                    <input type="checkbox" className="checkbox" />
                                </label>
                            </th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Tax Id</th>
                            <th>Stat Id</th>
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
                                <th>
                                    <label>
                                        <input type="checkbox" className="checkbox" />
                                    </label>
                                </th>
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
                                    <span className={`badge ${u.owed > 0 ? "badge-warning" : "badge-ghost"}`}>
                                        {u.owed}
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
                                    {selected.owed}
                                </span>
                            </li>
                        </ul>

                        <h4 className="mt-6 font-bold">Invoices</h4>
                        <p className="text-sm opacity-50">No invoices yet.</p>

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
                            placeholder="Stat ID (optional)"
                            value={form.statId}
                            onChange={e => setForm({ ...form, statId: e.target.value })}
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