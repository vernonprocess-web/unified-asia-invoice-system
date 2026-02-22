import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    FileSpreadsheet,
    Truck,
    Receipt,
    Settings
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: FileSpreadsheet },
    { name: 'Delivery Orders', href: '/delivery-orders', icon: Truck },
    { name: 'Statements', href: '/statements', icon: Receipt },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-brand text-gray-300">
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-5 pb-4">
                <div className="flex items-center flex-shrink-0 px-4 mb-6">
                    <span className="text-xl font-bold text-white tracking-wider">
                        UNIFIED ASIA
                    </span>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                                    ? 'bg-gray-800 text-white shadow-lg shadow-black/20'
                                    : 'hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon
                                className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-200"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}
