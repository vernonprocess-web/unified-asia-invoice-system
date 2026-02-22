import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Save, UploadCloud } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.get('/settings');
            setSettings(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', settings);
            alert("Settings saved successfully");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'qr') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = await api.uploadFile(`/settings/${type}`, file);
            setSettings((prev: any) => ({ ...prev, [type === 'logo' ? 'logo_url' : 'paynow_qr_url']: res[type === 'logo' ? 'logo_url' : 'paynow_qr_url'] }));
        } catch (e) {
            console.error(e);
            alert(`Failed to upload ${type}`);
        }
    };

    if (!settings) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Company Settings</h1>
                    <p className="mt-2 text-sm text-gray-500">Manage your company information and bank details for invoices.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md shadow-sm hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-6 mb-8">
                <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6 border-b pb-4">General Information</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Company Name</label>
                        <input
                            type="text"
                            value={settings.company_name || ''}
                            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">UEN</label>
                        <input
                            type="text"
                            value={settings.UEN || ''}
                            onChange={(e) => setSettings({ ...settings, UEN: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Address</label>
                        <input
                            type="text"
                            value={settings.address || ''}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
                        <input
                            type="email"
                            value={settings.email || ''}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-6 mb-8">
                <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6 border-b pb-4">Bank Details</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Bank Name</label>
                        <input
                            type="text"
                            value={settings.bank_name || ''}
                            onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Account Name</label>
                        <input
                            type="text"
                            value={settings.account_name || ''}
                            onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900">Account Number</label>
                        <input
                            type="text"
                            value={settings.account_number || ''}
                            onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-6">
                <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6 border-b pb-4">Branding & Payment Assets</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">

                    <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <label className="block text-sm font-medium text-gray-900 mb-4 w-full text-left">Company Logo</label>
                        {settings.logo_url ? (
                            <img src={`http://localhost:8787${settings.logo_url}`} alt="Logo" className="h-24 object-contain mb-4 bg-gray-50 p-2 rounded border" />
                        ) : (
                            <div className="h-24 w-48 bg-gray-100 mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 rounded">No logo uploaded</div>
                        )}
                        <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload Logo
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                        </label>
                    </div>

                    <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <label className="block text-sm font-medium text-gray-900 mb-4 w-full text-left">PayNow QR Code</label>
                        {settings.paynow_qr_url ? (
                            <img src={`http://localhost:8787${settings.paynow_qr_url}`} alt="PayNow QR" className="h-32 w-32 object-contain mb-4 bg-gray-50 p-2 rounded border" />
                        ) : (
                            <div className="h-32 w-32 bg-gray-100 mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 rounded">No QR uploaded</div>
                        )}
                        <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload QR Code
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'qr')} />
                        </label>
                    </div>

                </div>
            </div>
        </div>
    );
}
