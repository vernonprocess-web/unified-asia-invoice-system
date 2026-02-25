import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Download, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatCurrency';

export default function Statements() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        customer_id: '',
        date_from: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
        date_to: format(new Date(), 'yyyy-MM-dd')
    });
    const [statementData, setStatementData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const cData = await api.get('/customers');
            setCustomers(cData);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customer_id) return alert("Please select a customer.");

        setLoading(true);
        try {
            const data = await api.get(`/statements?customer_id=${formData.customer_id}&date_from=${formData.date_from}&date_to=${formData.date_to}`);
            setStatementData(data);
        } catch (e: any) {
            alert(e.message || "Failed to fetch statement");
        } finally {
            setLoading(false);
        }
    };

    const totalInvoiced = statementData?.invoices.reduce((acc: number, inv: any) => acc + (parseFloat(inv.total) || 0), 0) || 0;

    const handleExportPDF = async () => {
        if (!statementData) return;
        setGeneratingPdf(true);
        try {
            const settings = await api.get('/settings');
            const docData = { date_from: formData.date_from, date_to: formData.date_to, totalInvoiced };

            await generateAndDownloadPDF('Statement of Account', settings, docData, statementData.customer, statementData.invoices);
        } catch (e) {
            alert("Failed to generate Statement PDF");
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customer Statements</h1>
                    <p className="mt-2 text-sm text-gray-500">Generate statements of account for your clients.</p>
                </div>
                {statementData && (
                    <button
                        onClick={handleExportPDF}
                        disabled={generatingPdf}
                        className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
                    >
                        {generatingPdf ? <Loader2 className="-ml-0.5 mr-1.5 h-5 w-5 animate-spin" /> : <Download className="-ml-0.5 mr-1.5 h-5 w-5" />}
                        {generatingPdf ? 'Generating...' : 'Export Statement'}
                    </button>
                )}
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-4 items-end">
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-900">Customer</label>
                        <select required value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3">
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.company_name || c.customer_name}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-900">Date From</label>
                        <input required type="date" value={formData.date_from} onChange={e => setFormData({ ...formData, date_from: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-900">Date To</label>
                        <input required type="date" value={formData.date_to} onChange={e => setFormData({ ...formData, date_to: e.target.value })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3" />
                    </div>
                    <div className="sm:col-span-1 border">
                        <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            <Search className="w-4 h-4 mr-2" />
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {statementData && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Statement of Account</h3>
                            <p className="mt-1 text-sm text-gray-500">{statementData.customer.company_name || statementData.customer.customer_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Period: {format(new Date(formData.date_from), 'dd MMM yyyy')} - {format(new Date(formData.date_to), 'dd MMM yyyy')}</p>
                            <p className="mt-1 font-semibold text-lg text-gray-900">Total Billed: ${formatCurrency(totalInvoiced)}</p>
                        </div>
                    </div>
                    <div className="flow-root p-6">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-2 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th className="py-2 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                                    <th className="py-2 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {statementData.invoices.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td className="py-3 text-sm text-gray-500">{format(new Date(inv.issue_date), 'dd MMM yyyy')}</td>
                                        <td className="py-3 text-sm text-gray-900 font-medium">{inv.invoice_number}</td>
                                        <td className="py-3 text-sm text-gray-500">{format(new Date(inv.due_date), 'dd MMM yyyy')}</td>
                                        <td className="py-3 text-sm text-gray-900 font-semibold text-right">${formatCurrency(inv.total)}</td>
                                    </tr>
                                ))}
                                {statementData.invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-sm text-gray-500">No invoices found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
