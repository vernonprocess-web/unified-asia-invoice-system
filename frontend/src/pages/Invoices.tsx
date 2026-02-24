import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Edit2, Trash2, X, Download, Truck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { generateAndUploadPDF } from '../utils/pdfGenerator';

export default function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>({
        customer_id: '', issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        payment_terms: '30 Days', project_name: '', notes: '', items: []
    });

    const calculateDueDate = (issueDate: string, paymentTerms: string) => {
        if (!issueDate) return '';
        const match = paymentTerms ? paymentTerms.match(/(\d+)/) : null;
        const days = match ? parseInt(match[1], 10) : 0;

        const date = new Date(issueDate);
        date.setDate(date.getDate() + days);
        return format(date, 'yyyy-MM-dd');
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [iData, cData, pData, sData] = await Promise.all([
                api.get('/invoices'),
                api.get('/customers'),
                api.get('/products'),
                api.get('/settings')
            ]);
            setInvoices(iData);
            setCustomers(cData);
            setProducts(pData);
            setSettings(sData);
        } catch (e) {
            console.error(e);
        }
    };

    const calculateTotal = (items: any[]) => {
        return items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.items.length === 0) {
                return alert("Please add at least one item.");
            }
            const total = calculateTotal(formData.items);
            const payload = { ...formData, subtotal: total, total: total };

            if (editingId) {
                await api.put(`/invoices/${editingId}`, payload);
            } else {
                await api.post('/invoices', payload);
            }
            setShowForm(false);
            loadData();
        } catch (e: any) {
            alert(e.message || "Failed to save invoice");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await api.delete(`/invoices/${id}`);
            loadData();
        } catch (e: any) {
            alert(e.message || "Failed to delete invoice");
        }
    };

    const openEdit = async (inv: any) => {
        try {
            const fullInvoice = await api.get(`/invoices/${inv.id}`);
            setFormData(fullInvoice);
            setEditingId(inv.id);
            setShowForm(true);
        } catch (e) {
            alert("Failed to fetch invoice details");
        }
    };

    const openCreate = () => {
        setFormData({
            customer_id: '', issue_date: format(new Date(), 'yyyy-MM-dd'),
            due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            payment_terms: '30 Days', project_name: '', notes: '', items: []
        });
        setEditingId(null);
        setShowForm(true);
    };

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', description: '', quantity: 1, unit_price: 0, amount: 0 }]
        });
    };

    const removeItemRow = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        const item = newItems[index];
        item[field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value.toString());
            if (product) {
                item.description = product.name;
                item.unit_price = product.unit_price;
            }
        }

        if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
            item.amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        }

        setFormData({ ...formData, items: newItems });
    };

    const totalAmount = calculateTotal(formData.items);

    const handleConvertToDO = async (inv: any) => {
        try {
            const fullInvoice = await api.get(`/invoices/${inv.id}`);

            const doPayload = {
                invoice_id: fullInvoice.id,
                customer_id: fullInvoice.customer_id,
                project_name: fullInvoice.project_name,
                delivery_date: format(new Date(), 'yyyy-MM-dd'),
                delivery_status: 'Pending',
                items: fullInvoice.items.map((item: any) => ({
                    product_id: item.product_id,
                    description: item.description,
                    quantity: item.quantity,
                }))
            };

            await api.post('/delivery-orders', doPayload);
            alert("Successfully converted Invoice to Delivery Order. Please check the Delivery Orders page.");
        } catch (e: any) {
            alert(e.message || "Failed to convert to delivery order");
        }
    };

    const handleGeneratePDF = async (inv: any) => {
        setGeneratingPdf(inv.id);
        try {
            const fullInvoice = await api.get(`/invoices/${inv.id}`);
            const customer = customers.find(c => c.id === inv.customer_id);
            await generateAndUploadPDF('Tax Invoice', settings, fullInvoice, customer, fullInvoice.items, `/invoices/${inv.id}/pdf`);
            loadData();
        } catch (e) {
            alert("Failed to generate PDF");
        } finally {
            setGeneratingPdf(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Invoices</h1>
                    <p className="mt-2 text-sm text-gray-500">Create and manage invoices for your deliveries and services.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        New Invoice
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Invoice' : 'New Invoice'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-4 mb-8 border-b border-gray-200 pb-8">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Customer</label>
                                    <select required value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3">
                                        <option value="">Select a customer</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.company_name || c.customer_name} ({c.customer_code})</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Project / Site Name</label>
                                    <input type="text" value={formData.project_name || ''} onChange={e => setFormData({ ...formData, project_name: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Invoice Date</label>
                                    <input required type="date" value={formData.issue_date} onChange={e => {
                                        const newDate = e.target.value;
                                        setFormData({ ...formData, issue_date: newDate, due_date: calculateDueDate(newDate, formData.payment_terms) });
                                    }} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Due Date</label>
                                    <input required type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900">Payment Term</label>
                                    <div className="mt-2 flex gap-2">
                                        <select
                                            value={['7 Days', '14 Days', '30 Days', 'Cash on Delivery', '50% Deposit, 50% Before Delivery', 'Immediate Payment'].includes(formData.payment_terms) ? formData.payment_terms : 'custom'}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val !== 'custom') {
                                                    setFormData({ ...formData, payment_terms: val, due_date: calculateDueDate(formData.issue_date, val) });
                                                } else {
                                                    setFormData({ ...formData, payment_terms: '' });
                                                }
                                            }}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                                        >
                                            <option value="7 Days">7 Days</option>
                                            <option value="14 Days">14 Days</option>
                                            <option value="30 Days">30 Days</option>
                                            <option value="Cash on Delivery">Cash on Delivery</option>
                                            <option value="50% Deposit, 50% Before Delivery">50% Deposit, 50% Before Delivery</option>
                                            <option value="Immediate Payment">Immediate Payment</option>
                                            <option value="custom">Custom...</option>
                                        </select>
                                        {!['7 Days', '14 Days', '30 Days', 'Cash on Delivery', '50% Deposit, 50% Before Delivery', 'Immediate Payment'].includes(formData.payment_terms) && (
                                            <input
                                                type="text"
                                                value={formData.payment_terms}
                                                onChange={e => {
                                                    setFormData({ ...formData, payment_terms: e.target.value, due_date: calculateDueDate(formData.issue_date, e.target.value) });
                                                }}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                                                placeholder="e.g. 45 Days"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-medium text-gray-900">Items</h4>
                                    <button type="button" onClick={addItemRow} className="text-sm text-brand font-medium hover:text-brand/80">+ Add Item</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Product</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Description</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Qty</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Unit Price</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Amount</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {formData.items.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-2 py-2">
                                                        <select required value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3">
                                                            <option value="">Select...</option>
                                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input type="text" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input type="number" min="1" step="0.01" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                                                    </td>
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                                        ${(item.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-2 py-2 text-right">
                                                        <button type="button" onClick={() => removeItemRow(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {formData.items.length === 0 && (
                                        <div className="py-4 text-center text-sm text-gray-500 border-b border-gray-200">No items added yet.</div>
                                    )}
                                    <div className="pt-4 flex justify-end">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Total Amount</div>
                                            <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">Notes / Remarks</label>
                                <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" placeholder="Additional remarks or terms" />
                            </div>

                            <div className="mt-8 flex justify-end gap-x-3 border-t pt-5">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-md shadow-sm hover:bg-opacity-90">Save Invoice</button>
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
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Invoice #</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Invoice Date</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{inv.invoice_number}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{inv.company_name || inv.customer_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(new Date(inv.issue_date), 'dd MMM yyyy')}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(new Date(inv.due_date), 'dd MMM yyyy')}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">${inv.total.toFixed(2)}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3 flex justify-end items-center">
                                                <button onClick={() => handleGeneratePDF(inv)} disabled={generatingPdf === inv.id} className="text-blue-600 hover:text-blue-900 inline-flex items-center" title="Download Document">{generatingPdf === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}</button>
                                                <button onClick={() => handleConvertToDO(inv)} title="Convert to Delivery Order" className="text-green-600 hover:text-green-900 inline-flex items-center"><Truck className="w-4 h-4" /></button>
                                                <button onClick={() => openEdit(inv)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-900 inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {invoices.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No invoices found.</td>
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
