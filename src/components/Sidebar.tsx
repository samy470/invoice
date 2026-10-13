import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { FaUserPlus } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";

export default function Sidebar({ children, isLoggedIn, setIsLoggedIn, username, setUsername }: { children: React.ReactNode, isLoggedIn: boolean, setIsLoggedIn: (value: boolean) => void, username: string, setUsername: (value: string) => void }) {
    const [title, setTitle] = useState('')
    const navigate = useNavigate()

    function handleLogout() {
        setIsLoggedIn(false)
        setUsername('')
        localStorage.removeItem('token')
        navigate('/')
    }

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
                {children}
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {/* List item */}
                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Dashboard" to={'/'} onClick={() => { setTitle("Dashboard") }}>
                                <MdDashboard />
                                <span className="is-drawer-close:hidden">Dashboard</span>
                            </Link>
                        </li>

                        {/* List item */}
                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Clients" to={'/clients'} onClick={() => { setTitle("Clients") }}>
                                <FaUsers />
                                <span className="is-drawer-close:hidden">Clients</span>
                            </Link>
                        </li>

                        <li>
                            <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Invoices" to={'/invoices'} onClick={() => { setTitle("Invoices") }}>
                                <FaFileInvoiceDollar />
                                <span className="is-drawer-close:hidden">Invoices</span>
                            </Link>
                        </li>
                    </ul>
                    {isLoggedIn ? (
                        <ul className="menu w-full">
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Invoices" to={'/profile'} onClick={() => { setTitle("Profile") }}>
                                    <CgProfile />
                                    <span className="is-drawer-close:hidden">{username}</span>
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                                >
                                    <IoLogOutOutline />
                                    <span className="is-drawer-close:hidden">Logout</span>
                                </button>
                            </li>
                            </ul>
                            ) : (
                            <ul className="menu w-full">
                                <li>
                                    <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Login" to={'/login'} onClick={() => { setTitle("Login") }}>
                                        <CiLogin />
                                        <span className="is-drawer-close:hidden">Login</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Register" to={'/register'} onClick={() => { setTitle("Register") }}>
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