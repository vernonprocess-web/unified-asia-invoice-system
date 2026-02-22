import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, FileText, FileSpreadsheet, Truck } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Quotations</dt>
                                    <dd>
                                        <NavLink to="/quotations" className="text-lg font-medium text-brand hover:underline">Manage Quotes</NavLink>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileSpreadsheet className="h-6 w-6 text-blue-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Invoices</dt>
                                    <dd>
                                        <NavLink to="/invoices" className="text-lg font-medium text-brand hover:underline">Manage Invoices</NavLink>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Truck className="h-6 w-6 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Delivery Orders</dt>
                                    <dd>
                                        <NavLink to="/delivery-orders" className="text-lg font-medium text-brand hover:underline">Manage DOs</NavLink>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-orange-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Customers</dt>
                                    <dd>
                                        <NavLink to="/customers" className="text-lg font-medium text-brand hover:underline">Manage Clients</NavLink>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
