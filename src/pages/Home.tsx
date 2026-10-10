import { useState, useEffect } from "react"
const API = 'https://invoice-back-zcg0.onrender.com'
type Stats = { invoiced: number; paid: number; unpaid: number; clients: number }

const fmt = (n: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(n)

export default function Home() {
    const [stats, setStats] = useState<Stats>({ invoiced: 0, paid: 0, unpaid: 0, clients: 0 })

    useEffect(() => {
        fetch('https://invoice-back-zcg0.onrender.com/getDash')
            .then(res => res.json())
            .then(data => setStats(data))
    }, [])

    return (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Total invoiced</div>
                    <div className="stat-value text-2xl">{fmt(stats.invoiced)}</div>
                </div>
            </div>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Paid</div>
                    <div className="stat-value text-2xl text-success">{fmt(stats.paid)}</div>
                </div>
            </div>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Unpaid</div>
                    <div className="stat-value text-2xl text-warning">{fmt(stats.unpaid)}</div>
                </div>
            </div>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Clients</div>
                    <div className="stat-value text-2xl">{stats.clients}</div>
                </div>
            </div>
        </div>
    )
}
