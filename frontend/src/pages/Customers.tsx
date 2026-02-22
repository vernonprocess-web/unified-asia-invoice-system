import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Customers() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        customer_code: '', customer_name: '', company_name: '', UEN: '',
        billing_address: '', delivery_address: '', contact_person: '', phone: '', email: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await api.get('/customers');
            setCustomers(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/customers/${editingId}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setShowForm(false);
            loadCustomers();
        } catch (e: any) {
            alert(e.message || "Failed to save customer");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            await api.delete(`/customers/${id}`);
            loadCustomers();
        } catch (e: any) {
            alert(e.message || "Failed to delete customer");
        }
    };

    const openEdit = (customer: any) => {
        setFormData(customer);
        setEditingId(customer.id);
        setShowForm(true);
    };

    const openCreate = () => {
        setFormData({
            customer_code: '', customer_name: '', company_name: '', UEN: '',
            billing_address: '', delivery_address: '', contact_person: '', phone: '', email: ''
        });
        setEditingId(null);
        setShowForm(true);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers</h1>
                    <p className="mt-2 text-sm text-gray-500">Manage your clients and their billing details.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Add Customer
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Customer Code</label>
                                    <input required type="text" value={formData.customer_code} onChange={e => setFormData({ ...formData, customer_code: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Customer Name</label>
                                    <input required type="text" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Company Name</label>
                                    <input type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">UEN</label>
                                    <input type="text" value={formData.UEN} onChange={e => setFormData({ ...formData, UEN: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Contact Person</label>
                                    <input type="text" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Phone</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Billing Address</label>
                                    <textarea rows={2} value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Delivery Address</label>
                                    <textarea rows={2} value={formData.delivery_address} onChange={e => setFormData({ ...formData, delivery_address: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-x-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-3 py-2 text-sm font-semibold text-white bg-brand rounded-md shadow-sm hover:bg-opacity-90">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Code</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{customer.customer_code}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.customer_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.company_name || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.phone || '-'}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => openEdit(customer)} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900 inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No customers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
