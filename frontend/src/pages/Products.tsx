import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function Products() {
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        product_code: '', name: '', description: '', SKU: '', unit_price: '', unit: 'pcs'
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await api.get('/products');
            setProducts(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, unit_price: parseFloat(formData.unit_price) };
            if (editingId) {
                await api.put(`/products/${editingId}`, payload);
            } else {
                await api.post('/products', payload);
            }
            setShowForm(false);
            loadProducts();
        } catch (e: any) {
            alert(e.message || "Failed to save product");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            loadProducts();
        } catch (e: any) {
            alert(e.message || "Failed to delete product");
        }
    };

    const openEdit = (product: any) => {
        setFormData({ ...product, unit_price: product.unit_price.toString() });
        setEditingId(product.id);
        setShowForm(true);
    };

    const openCreate = () => {
        setFormData({ product_code: '', name: '', description: '', SKU: '', unit_price: '', unit: 'pcs' });
        setEditingId(null);
        setShowForm(true);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products & Services</h1>
                    <p className="mt-2 text-sm text-gray-500">Manage your inventory, products, and services for invoicing.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Product Code</label>
                                    <input required type="text" value={formData.product_code} onChange={e => setFormData({ ...formData, product_code: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">SKU (Optional)</label>
                                    <input type="text" value={formData.SKU} onChange={e => setFormData({ ...formData, SKU: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Unit Price</label>
                                    <input required type="number" step="0.01" min="0" value={formData.unit_price} onChange={e => setFormData({ ...formData, unit_price: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Unit of Measurement</label>
                                    <input required type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. pcs, hours, kg" className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Description</label>
                                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
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
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{product.product_code}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{product.name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.SKU || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">${formatCurrency(product.unit_price)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.unit}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => openEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No products found.</td>
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
