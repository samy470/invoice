import { useState, useEffect } from "react"

type Client = { id: number; name: string }
type Item = { description: string; qty: number; price: number }
type Inoivce = {
    id: number
    invoiceNumber: string
    clientName: string
    clientEmail?: string
    clientPhone?: string
    clientTaxId?: string
    clientRc?: string
    date: string
    dueDate: string
    total: number
    status: string
    clientId: number
    taxRate: number
    items: Item[]
}

type Profile = {
    businessName?: string; activity?: string; address?: string; phone?: string; email?: string
    rc?: string; taxId?: string; statId?: string; rib?: string
}

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}
const emptyItem = (): Item => ({ description: "", qty: 1, price: 0 })

const U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze",
    "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
const T = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"]

const below100 = (n: number, final: boolean): string => {
    if (n < 20) return U[n]
    if (n < 70) {
        const u = n % 10
        return T[Math.floor(n / 10)] + (u === 1 ? " et un" : u ? "-" + U[u] : "")
    }
    if (n < 80) return n === 71 ? "soixante et onze" : "soixante-" + U[n - 60]
    if (n === 80) return final ? "quatre-vingts" : "quatre-vingt"
    return "quatre-vingt-" + U[n - 80]
}

const below1000 = (n: number, final: boolean): string => {
    const c = Math.floor(n / 100), r = n % 100
    let s = ""
    if (c > 0) s = (c > 1 ? U[c] + " " : "") + "cent" + (c > 1 && r === 0 && final ? "s" : "")
    if (r > 0) s += (c > 0 ? " " : "") + below100(r, final)
    return s
}

const intToWords = (n: number): string => {
    if (n === 0) return "zéro"
    const m = Math.floor(n / 1e6), t = Math.floor((n % 1e6) / 1000), r = n % 1000
    const parts: string[] = []
    if (m) parts.push(below1000(m, false) + " million" + (m > 1 ? "s" : ""))
    if (t) parts.push(t === 1 ? "mille" : below1000(t, false) + " mille")
    if (r) parts.push(below1000(r, true))
    return parts.join(" ")
}

const NAMES: Record<string, [string, string]> = {
    DZD: ["dinar algérien", "dinars algériens"],
    EUR: ["euro", "euros"],
    USD: ["dollar américain", "dollars américains"],
    MAD: ["dirham marocain", "dirhams marocains"],
    TND: ["dinar tunisien", "dinars tunisiens"],
}

const amountInWords = (amount: number, currency: string) => {
    const total = Math.round(amount * 100)
    const whole = Math.floor(total / 100), cents = total % 100
    const [one, many] = NAMES[currency] ?? [currency, currency]
    let s = `${intToWords(whole)} ${whole > 1 ? many : one}`
    if (cents) s += ` et ${intToWords(cents)} centime${cents > 1 ? "s" : ""}`
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function Invoices({ s }: { s: { currency: string; taxRate: number } }) {
    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency: s.currency }).format(n)

    const emptyForm = () => ({
        clientId: "",
        date: today(),
        dueDate: inDays(30),
        taxRate: s.taxRate,
        items: [emptyItem()],
    })

    const [invoices, setInvoices] = useState<Inoivce[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [selected, setSelected] = useState<Inoivce | null>(null)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [profile, setProfile] = useState<Profile>({})

    const subtotal = form.items.reduce((s: number, i: any) => s + i.qty * i.price, 0)
    const tax = (subtotal * form.taxRate) / 100
    const totals = { subtotal, tax, total: subtotal + tax }

    const filtered = invoices.filter(u =>
        (u.clientName + " " + u.date).toLowerCase().includes(search.toLowerCase())
    )

    const getInvoices = () => {
        fetch(`${import.meta.env.VITE_API_URL}/getInvoices`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()).then(data => setInvoices(data))
    }

    const getUsers = () => {
        fetch(`${import.meta.env.VITE_API_URL}/getUsers`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()).then(data => setClients(data))
    }

    useEffect(() => {
        getInvoices()
    }, [])

    useEffect(() => {
        getUsers()
    }, [])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/getProfile`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(data => setProfile(data))
    }, [])

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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/updateInvoices`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ ...form, id: editingId })
            })
            const data = await res.json()
            alert(data.message)
        } else {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/addInvoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            alert(data.message)
        }
        getInvoices()
        closeForm()
    }

    const handleDelete = async (c: Inoivce) => {
        if (!window.confirm(`Delete ${c.invoiceNumber}?`)) return
        const res = await fetch(`${import.meta.env.VITE_API_URL}/deleteInvoices`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ id: c.id })
        })
        const data = await res.json()
        alert(data.message)
        await getInvoices()
    }

    const updateItem = (index: number, patch: Partial<Item>) =>
        setForm({
            ...form,
            items: form.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        })

    const changeStatus = async (id: number, e: string) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/changestatus`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ id, e })
        })
        await res.json()
        await getInvoices()
    }

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
                                        <option value="cancelled">Cancelled</option>
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
                    <div className="modal-box max-w-3xl">
                        <div id="print-area">
                            <div className="flex justify-between items-start border-b pb-3">
                                <div>
                                    <div className="text-xl font-bold">{profile.businessName}</div>
                                    {profile.activity && <div className="text-sm">{profile.activity}</div>}
                                    {profile.address && <div className="text-sm">{profile.address}</div>}
                                    <div className="text-sm">{[profile.phone, profile.email].filter(Boolean).join(" · ")}</div>
                                    <div className="text-xs opacity-70">
                                        {[
                                            profile.rc && `RC : ${profile.rc}`,
                                            profile.taxId && `NIF : ${profile.taxId}`,
                                            profile.statId && `NIS : ${profile.statId}`,
                                        ].filter(Boolean).join(" · ")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">FACTURE</div>
                                    <div>N° {selected.invoiceNumber}</div>
                                    <div className="text-sm">Date : {selected.date}</div>
                                    <div className="text-sm">Échéance : {selected.dueDate || "-"}</div>
                                </div>
                            </div>

                            <div className="mt-4 border rounded p-3 w-72">
                                <div className="text-xs opacity-60">FACTURÉ À</div>
                                <div className="font-bold">{selected.clientName}</div>
                                {selected.clientPhone && <div className="text-sm">Tél : {selected.clientPhone}</div>}
                                {selected.clientEmail && <div className="text-sm">{selected.clientEmail}</div>}
                                {selected.clientTaxId && <div className="text-sm">NIF : {selected.clientTaxId}</div>}
                                {selected.clientRc && <div className="text-sm">RC : {selected.clientRc}</div>}
                            </div>

                            <table className="table mt-4">
                                <thead>
                                    <tr>
                                        <th>Désignation</th>
                                        <th>Qté</th>
                                        <th>P.U. HT</th>
                                        <th className="text-right">Montant HT</th>
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
                                    <>
                                        <div className="mt-4 ml-auto w-64 flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="opacity-60">Total HT</span>
                                                <span>{fmt(sub)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="opacity-60">Tax ({selected.taxRate}%)</span>
                                                <span>{fmt(tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t pt-1">
                                                <span>Total TTC</span>
                                                <span>{fmt(sub + tax)}</span>
                                            </div>
                                            <p className="mt-3 text-sm italic">
                                                Arrêtée la présente facture à la somme de : {amountInWords(sub + tax, s.currency)}
                                            </p>
                                        </div>

                                        {selected.taxRate === 0 && (
                                            <p className="mt-3 text-sm italic">Not subject to Taxes</p>
                                        )}
                                    </>
                                )
                            })()}

                            {profile.rib && <p className="mt-4 text-xs opacity-70">Virement : {profile.rib}</p>}
                            <div className="mt-16 flex justify-end">
                                <div className="w-56 border-t pt-1 text-center text-sm">Signature et cachet</div>
                            </div>
                        </div>

                        <div className="modal-action no-print">
                            <button className="btn" onClick={() => {
                                const api = (window as any).electronAPI
                                if (api) api.savePdf(selected.invoiceNumber)
                                else window.print()
                            }}>Download PDF</button>
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
                        <h3 className="text-2xl font-bold">
                            {editingId !== null ? "Edit invoice" : "Add invoice"}
                        </h3>

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
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={form.taxRate > 0}
                                    onChange={e => setForm({ ...form, taxRate: e.target.checked ? 19 : 0 })}
                                />
                                <span>Tax applicable</span>
                            </label>
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
                                    <label className="input input-bordered w-32">
                                        <span className="label">Qty</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.qty}
                                            onChange={e => updateItem(index, { qty: Number(e.target.value) })}
                                        />
                                    </label>
                                    <label className="input input-bordered w-32">
                                        <span className="label">Price</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.price}
                                            onChange={e => updateItem(index, { price: Number(e.target.value) })}
                                        />
                                    </label>
                                    <span className="w-32 text-right">{fmt(item.qty * item.price)}</span>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => setForm({ ...form, items: form.items.length > 1 ? form.items.filter((_, i) => i !== index) : form.items, })}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-outline btn-sm w-fit" onClick={() => setForm({ ...form, items: [...form.items, { description: "", qty: 1, price: 0 }] })}>
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
