import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { FaUserPlus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";

type Settings = { currency: string; taxRate: number }

export default function Sidebar({ isLoggedIn, setIsLoggedIn, username, setUsername, s, setS }: { isLoggedIn: boolean, setIsLoggedIn: (value: boolean) => void, username: string, setUsername: (value: string) => void, s: Settings, setS: (value: Settings) => void }) {
    const [selected, setSelected] = useState(false)
    const [draft, setDraft] = useState<Settings>(s)
    const { pathname } = useLocation()
    const titles: Record<string, string> = {
        '/': 'Dashboard',
        '/clients': 'Clients',
        '/invoices': 'Invoices',
        '/profile': 'Profile',
    }
    const title = titles[pathname] ?? ''
    const navigate = useNavigate()

    function handleLogout() {
        setIsLoggedIn(false)
        setUsername('')
        localStorage.removeItem('token')
        navigate('/')
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login')
    }, [])

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle inline" />
            <div className="drawer-content">
                {/* Navbar */}
                <nav className="navbar w-full bg-base-300">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost drawer-button">
                        {/* Sidebar toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                    </label>
                    <div className="px-4">{title}</div>
                </nav>
                <Outlet />
                {/* Settins */}
                {selected && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="text-2xl font-bold">Settings</h3>
                            <ul className="mt-4 flex flex-col gap-4 text-sm">
                                <li className="flex flex-col gap-1">
                                    <span className="opacity-50">Currency:</span>
                                    <select className="select select-bordered" value={draft.currency}
                                        onChange={e => setDraft({ ...draft, currency: e.target.value })}>
                                        {["DZD", "EUR", "USD", "MAD", "TND"].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </li>
                                <li className="flex flex-col gap-1">
                                    <span className="opacity-50">Default tax rate (%):</span>
                                    <input type="number" min={0} max={100} step="0.01" className="input input-bordered"
                                        value={draft.taxRate} onChange={e => setDraft({ ...draft, taxRate: Number(e.target.value) })} />
                                </li>
                            </ul>

                            <div className="modal-action">
                                <button className="btn btn-ghost" onClick={() => setSelected(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => {
                                    setS(draft)
                                    localStorage.setItem("settings", JSON.stringify(draft))
                                    setSelected(false)
                                }}>Save</button>
                            </div>
                        </div>
                        <div className="modal-backdrop" onClick={() => setSelected(false)} />
                    </div>
                )}
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {/* List item */}
                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Dashboard" to={'/'}>
                                <MdDashboard />
                                <span className="is-drawer-close:hidden">Dashboard</span>
                            </Link>
                        </li>

                        {/* List item */}
                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Clients" to={'/clients'}>
                                <FaUsers />
                                <span className="is-drawer-close:hidden">Clients</span>
                            </Link>
                        </li>

                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Invoices" to={'/invoices'}>
                                <FaFileInvoiceDollar />
                                <span className="is-drawer-close:hidden">Invoices</span>
                            </Link>
                        </li>
                    </ul>
                    {isLoggedIn ? (
                        <ul className="menu w-full">
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Profile" to={'/profile'}>
                                    <CgProfile />
                                    <span className="is-drawer-close:hidden">{username}</span>
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => { setDraft(s); setSelected(true) }}
                                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings"
                                >
                                    <IoSettingsOutline />
                                    <span className="is-drawer-close:hidden">Settings</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                >
                                    <IoLogOutOutline />
                                    <span className="is-drawer-close:hidden">Logout</span>
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="menu w-full">
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Login" to={'/login'}>
                                    <CiLogin />
                                    <span className="is-drawer-close:hidden">Login</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Register" to={'/register'}>
                                    <FaUserPlus />
                                    <span className="is-drawer-close:hidden">Register</span>
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}