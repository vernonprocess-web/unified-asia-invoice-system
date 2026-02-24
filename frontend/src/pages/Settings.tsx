import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Save, UploadCloud, FileCode2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PlaceholderRegistry } from '../components/PlaceholderRegistry';

export default function Settings() {
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [viewingRegistry, setViewingRegistry] = useState(false);

    // DOCX Upload States
    const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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

    const downloadBaseTemplate = async (templateType: string) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';
            const response = await fetch(`${API_URL}/template-files/generate-base/${templateType}`);
            if (!response.ok) throw new Error("Failed to generate base template");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `base_template_${templateType}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error(e);
            alert("Error generating the base template.");
        }
    };

    const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>, templateType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('template_type', templateType);

            setUploadingState(prev => ({ ...prev, [templateType]: true }));
            setUploadError(null);
            setUploadSuccess(null);

            const response = await fetch('http://localhost:8787/api/template-files/validate-upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.details && result.details.length > 0) {
                    const invalid = result.details[0];
                    setUploadError(`Invalid placeholder: {{${invalid.placeholder}}}. ${invalid.error} ${invalid.suggestion || ''}`);
                } else {
                    setUploadError(result.error || 'Failed to validate template.');
                }
            } else {
                setUploadSuccess(`Custom Template successfully mapped for ${templateType.replace('_', ' ')}!`);
            }
        } catch (e) {
            setUploadError('Network error while uploading template.');
        } finally {
            setUploadingState(prev => ({ ...prev, [templateType]: false }));
            e.target.value = ''; // Reset input
        }
    };

    if (!settings) return <div className="p-8">Loading settings...</div>;

    if (viewingRegistry) {
        return <PlaceholderRegistry onClose={() => setViewingRegistry(false)} />;
    }

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

            {/* Document Templates Section */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 p-6 mb-8 border-t-4 border-brand">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-lg font-semibold leading-7 text-gray-900">Document Templates</h2>
                        <p className="text-sm text-gray-500">Customize the PDF layout and branding for your daily documents. Upload your own DOCX template to auto-populate layout properties.</p>
                    </div>
                    <button
                        onClick={() => setViewingRegistry(true)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md shadow-sm hover:bg-gray-200 transition-all font-medium border"
                    >
                        <FileCode2 className="w-4 h-4 mr-2" />
                        Placeholder Registry
                    </button>
                </div>

                {uploadError && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md text-sm flex items-start">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                    </div>
                )}

                {uploadSuccess && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md text-sm flex items-start">
                        <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                        <span>{uploadSuccess}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quotation */}
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                            <FileCode2 className="w-8 h-8 text-brand" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Quotation Template</h3>
                        <p className="text-sm text-gray-500 mb-6 h-10">Upload custom DOCX to format Quotes.</p>

                        <div className="flex flex-col w-full space-y-3">
                            <label className={`w-full flex justify-center items-center px-4 py-2 bg-brand border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-opacity-90 cursor-pointer ${uploadingState['quotation'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <UploadCloud className="w-4 h-4 mr-2" />
                                {uploadingState['quotation'] ? 'Uploading...' : 'Upload DOCX'}
                                <input type="file" className="hidden" accept=".docx" onChange={(e) => handleTemplateUpload(e, 'quotation')} disabled={uploadingState['quotation']} />
                            </label>
                            <button
                                onClick={() => downloadBaseTemplate('quotation')}
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Base
                            </button>
                        </div>
                    </div>

                    {/* Invoice */}
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                            <FileCode2 className="w-8 h-8 text-brand" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Tax Invoice Template</h3>
                        <p className="text-sm text-gray-500 mb-6 h-10">Upload custom DOCX to format Invoices.</p>

                        <div className="flex flex-col w-full space-y-3">
                            <label className={`w-full flex justify-center items-center px-4 py-2 bg-brand border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-opacity-90 cursor-pointer ${uploadingState['invoice'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <UploadCloud className="w-4 h-4 mr-2" />
                                {uploadingState['invoice'] ? 'Uploading...' : 'Upload DOCX'}
                                <input type="file" className="hidden" accept=".docx" onChange={(e) => handleTemplateUpload(e, 'invoice')} disabled={uploadingState['invoice']} />
                            </label>
                            <button
                                onClick={() => downloadBaseTemplate('invoice')}
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Base
                            </button>
                        </div>
                    </div>

                    {/* Delivery Order */}
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                            <FileCode2 className="w-8 h-8 text-brand" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Delivery Order Template</h3>
                        <p className="text-sm text-gray-500 mb-6 h-10">Upload custom DOCX to format DOs.</p>

                        <div className="flex flex-col w-full space-y-3">
                            <label className={`w-full flex justify-center items-center px-4 py-2 bg-brand border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-opacity-90 cursor-pointer ${uploadingState['delivery_order'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <UploadCloud className="w-4 h-4 mr-2" />
                                {uploadingState['delivery_order'] ? 'Uploading...' : 'Upload DOCX'}
                                <input type="file" className="hidden" accept=".docx" onChange={(e) => handleTemplateUpload(e, 'delivery_order')} disabled={uploadingState['delivery_order']} />
                            </label>
                            <button
                                onClick={() => downloadBaseTemplate('delivery_order')}
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Base
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
