import { useState, useEffect } from "react"

type Client = { id: number; name: string }
type Item = { description: string; qty: number; price: number }
type Inoivce = {
    id: number
    invoiceNumber: string
    clientName: string
    date: string
    dueDate: string
    total: number
    status: string
    clientId: number
    taxRate: number
    items: Item[]
}

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}
const emptyItem = (): Item => ({ description: "", qty: 1, price: 0 })
const emptyForm = () => ({
    clientId: "",
    date: today(),
    dueDate: inDays(30),
    taxRate: 19,
    items: [emptyItem()],
})
const fmt = (n: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(n)

export default function Invoices() {
    const [invoices, setInvoices] = useState<Inoivce[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [selected, setSelected] = useState<Inoivce | null>(null)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState(emptyForm)

    const subtotal = form.items.reduce((s: number, i: any) => s + i.qty * i.price, 0)
    const tax = (subtotal * form.taxRate) / 100
    const totals = { subtotal, tax, total: subtotal + tax }

    const filtered = invoices.filter(u =>
        (u.clientName + " " + u.date).toLowerCase().includes(search.toLowerCase())
    )

    const openAdd = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormOpen(true)
    }

    const openEdit = (c: Inoivce) => {
        setSelected(null)
        setEditingId(c.id)
        setForm({
            clientId: String(c.clientId),
            date: c.date,
            dueDate: c.dueDate,
            taxRate: c.taxRate,
            items: c.items
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

        if (editingId !== null) {
            const res = await fetch('https://invoice-back-zcg0.onrender.com/updateInvoices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, id: editingId })
            })
            const data = await res.json()
            alert(data.message)
        } else {
            const res = await fetch('http://localhost:8000/addInvoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            alert(data.message)
        }
        closeForm()
    }

    const handleDelete = async (c: Inoivce) => {
        const res = await fetch('http://localhost:8000/deleteInvoices', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: c.id })
        })
        const data = await res.json()
        alert(data.message)
    }

    const updateItem = (index: number, patch: Partial<Item>) =>
        setForm({
            ...form,
            items: form.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        })

    const changeStatus = async (id: number, e: string) => {
        const res = await fetch('http://localhost:8000/changestatus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, e })
        })
        const data = await res.json()
        alert(data.message)
    }

    useEffect(() => {
        fetch('http://localhost:8000/getInvoices').then(res => res.json()).then(data => setInvoices(data))
    }, [handleSave])

    useEffect(() => {
        fetch('http://localhost:8000/getUsers').then(res => res.json()).then(data => setClients(data))
    }, [openAdd])

    return (
        <div className="p-6">
            {/* top bar */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    className="input input-bordered w-72"
                    placeholder="Search invvoice"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAdd}>
                    Add invoice
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>INV</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Due</th>
                            <th>Total</th>
                            <th>Status Badge</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center opacity-50">
                                    No invoices yet. Click New invoice to create one.
                                </td>
                            </tr>
                        )}
                        {filtered.map(inv => (
                            <tr key={inv.id}>
                                <td className="font-bold">{inv.invoiceNumber}</td>
                                <td>{inv.clientName}</td>
                                <td>{inv.date}</td>
                                <td>{inv.dueDate}</td>
                                <td>{fmt(inv.items.reduce((s, i) => s + i.qty * i.price, 0) * (1 + inv.taxRate / 100))}</td>
                                <td>
                                    <select value={inv.status} onChange={e => changeStatus(inv.id, e.target.value)}>
                                        <option value="sent">Unpaid</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </td>
                                <th>
                                    <div className="flex gap-1">
                                        <button className="btn btn-ghost btn-xs" onClick={() => setSelected(inv)}>
                                            details
                                        </button>
                                        <button className="btn btn-ghost btn-xs" onClick={() => openEdit(inv)}>
                                            edit
                                        </button>
                                        <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(inv)}>
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
        <div className="modal-box max-w-2xl">
            <div id="print-area">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold">{selected.invoiceNumber}</h3>
                        <p className="opacity-60">{selected.clientName}</p>
                    </div>
                    <span className="badge badge-ghost">{selected.status}</span>
                </div>

                <p className="text-sm opacity-60 mt-2">
                    Issued {selected.date} · Due {selected.dueDate}
                </p>

                <table className="table mt-4">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selected.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.description}</td>
                                <td>{item.qty}</td>
                                <td>{fmt(item.price)}</td>
                                <td className="text-right">{fmt(item.qty * item.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(() => {
                    const sub = selected.items.reduce((s, i) => s + i.qty * i.price, 0)
                    const tax = (sub * selected.taxRate) / 100
                    return (
                        <div className="mt-4 ml-auto w-64 flex flex-col gap-1">
                            <div className="flex justify-between">
                                <span className="opacity-60">Subtotal</span>
                                <span>{fmt(sub)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Tax ({selected.taxRate}%)</span>
                                <span>{fmt(tax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-1">
                                <span>Total</span>
                                <span>{fmt(sub + tax)}</span>
                            </div>
                        </div>
                    )
                })()}
            </div>

            <div className="modal-action no-print">
                <button className="btn" onClick={() => window.print()}>Download PDF</button>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
        </div>
        <div className="modal-backdrop no-print" onClick={() => setSelected(null)} />
    </div>
)}
            {/* add / edit modal */}
            {formOpen && (
                <div className="modal modal-open">
                    <form className="modal-box max-w-3xl flex flex-col gap-4" onSubmit={handleSave}>
                        <h3 className="text-2xl font-bold">New invoice</h3>

                        <select
                            className="select select-bordered w-full"
                            value={form.clientId}
                            onChange={e => setForm({ ...form, clientId: e.target.value })}
                            required
                        >
                            <option value="">Select a client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-4">
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={form.dueDate}
                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            {form.items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        className="input input-bordered flex-1"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={e => updateItem(index, { description: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        min={1}
                                        className="input input-bordered w-24"
                                        value={item.qty}
                                        onChange={e => updateItem(index, { qty: Number(e.target.value) })}
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        className="input input-bordered w-32"
                                        value={item.price}
                                        onChange={e => updateItem(index, { price: Number(e.target.value) })}
                                    />
                                    <span className="w-32 text-right">{fmt(item.qty * item.price)}</span>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => setForm({ ...form, items: form.items.slice(0, -1) })}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-outline btn-sm w-fit" onClick={() => setForm({ ...form, items: [...form.items, { description: "", qty: 0, price: 0 }] })}>
                                Add item
                            </button>
                        </div>

                        <div className="ml-auto w-64 flex flex-col gap-1">
                            <div className="flex justify-between">
                                <span className="opacity-60">Subtotal</span>
                                <span>{fmt(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Tax ({form.taxRate}%)</span>
                                <span>{fmt(totals.tax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-1">
                                <span>Total</span>
                                <span>{fmt(totals.total)}</span>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                    <div className="modal-backdrop" onClick={closeForm} />
                </div>
            )}
        </div>
    )
}
