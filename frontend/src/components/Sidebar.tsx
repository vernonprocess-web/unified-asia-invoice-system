import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    FileSpreadsheet,
    Truck,
    Receipt,
    Settings,
    ChevronDown,
    Building2,
    Plus,
    Info
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: FileSpreadsheet },
    { name: 'Delivery Orders', href: '/delivery-orders', icon: Truck },
    { name: 'Statements', href: '/statements', icon: Receipt },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Placeholders', href: '/placeholders', icon: Info },
];

export default function Sidebar() {
    const { activeCompany, companies, switchCompany } = useCompany();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div 
            className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 text-gray-300 transition-colors duration-500"
            style={{ backgroundColor: activeCompany?.profile_color || '#0f172a' }}
        >
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-5 pb-4">
                <div className="px-4 mb-6 relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center w-full p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all group border border-white/10"
                    >
                        <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                            {activeCompany?.logo_url ? (
                                <img src={`${API_URL.replace('/api', '')}${activeCompany.logo_url}`} alt="Comp" className="h-full w-full object-contain p-1" />
                            ) : (
                                <Building2 className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div className="ml-3 text-left overflow-hidden">
                            <p className="text-sm font-bold text-white truncate leading-tight">
                                {activeCompany?.company_name || 'Select Company'}
                            </p>
                            <p className="text-[10px] text-white/60 truncate uppercase tracking-wider">
                                {activeCompany?.company_code || '---'}
                            </p>
                        </div>
                        <ChevronDown className={`ml-auto h-4 w-4 text-white/60 group-hover:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-2">
                                <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch Profile</p>
                                {companies.map((company) => (
                                    <button
                                        key={company.id}
                                        onClick={() => {
                                            switchCompany(company.id);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div 
                                            className={`h-2 w-2 rounded-full mr-3 ${company.is_active ? 'animate-pulse' : 'bg-transparent border border-gray-300'}`}
                                            style={{ backgroundColor: company.is_active ? company.profile_color : 'transparent' }}
                                        />
                                        <div className="text-left overflow-hidden">
                                            <p className={`text-sm font-semibold truncate ${company.is_active ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {company.company_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase">{company.company_code}</p>
                                        </div>
                                        {company.is_active && (
                                            <div className="ml-auto bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase">ACTIVE</div>
                                        )}
                                    </button>
                                ))}
                                
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-brand transition-colors text-sm font-medium"
                                    >
                                        <Plus className="h-4 w-4 mr-3" />
                                        Add New Company
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon
                                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                                    'group-hover:text-white'
                                } text-white/50`}
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
