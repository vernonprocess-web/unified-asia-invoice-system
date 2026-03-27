import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { 
    Save, 
    UploadCloud, 
    FileCode2, 
    Download, 
    AlertCircle, 
    CheckCircle2, 
    Plus, 
    Building2, 
    Trash2, 
    ChevronRight,
    Palette
} from 'lucide-react';
import { PlaceholderRegistry } from '../components/PlaceholderRegistry';
import { useCompany } from '../context/CompanyContext';
import type { Company } from '../context/CompanyContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

export default function Settings() {
    const { companies, activeCompany, refreshCompanies, switchCompany } = useCompany();
    const [editingCompanyId, setEditingCompanyId] = useState<number | null>(activeCompany?.id || null);
    const [formData, setFormData] = useState<Partial<Company>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [viewingRegistry, setViewingRegistry] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Template Upload States
    const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});
    const [templateFile, setTemplateFile] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (editingCompanyId) {
            const company = companies.find(c => c.id === editingCompanyId);
            if (company) {
                setFormData(company);
                loadCompanyTemplates(company.id);
            }
        } else {
            // New company defaults
            setFormData({
                company_name: '',
                company_code: '',
                profile_color: '#0f172a'
            });
        }
    }, [editingCompanyId, companies]);

    const loadCompanyTemplates = async (companyId: number) => {
        // The backend GET /:type now uses the active company from the DB.
        // To properly manage templates for NON-ACTIVE companies during edit,
        // we might need a more specific backend endpoint.
        // For simplicity in this lightweight app, the user usually manages templates
        // for the ACTIVE company. We'll focus on the active company's templates.
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic frontend validation
        if (!formData.company_name?.trim() || !formData.company_code?.trim()) {
            setError("Company Name and Doc Code (Prefix) are required.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (editingCompanyId) {
                await api.put(`/settings/${editingCompanyId}`, formData);
                setSuccess("Company profile updated successfully");
            } else {
                const newCompany = await api.post('/settings', formData);
                setEditingCompanyId(newCompany.id);
                setSuccess("New company profile created");
            }
            await refreshCompanies();
        } catch (e: any) {
            let msg = e.message || "Failed to save company profile";
            try {
                const parsed = JSON.parse(msg);
                if (parsed.error) msg = parsed.error;
            } catch {
                // Not JSON
            }
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this company profile?")) return;
        try {
            await api.delete(`/settings/${id}`);
            if (editingCompanyId === id) setEditingCompanyId(activeCompany?.id || null);
            await refreshCompanies();
            setSuccess("Company profile deleted");
        } catch (e: any) {
            alert(e.message || "Failed to delete company");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'qr') => {
        if (!editingCompanyId) return;
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await api.uploadFile(`/settings/${editingCompanyId}/${type}`, file);
            setFormData(prev => ({ ...prev, [type === 'logo' ? 'logo_url' : 'paynow_qr_url']: res[type === 'logo' ? 'logo_url' : 'paynow_qr_url'] }));
            await refreshCompanies();
        } catch (e) {
            setError(`Failed to upload ${type}`);
        }
    };

    const downloadBaseTemplate = async (templateType: string) => {
        try {
            const response = await fetch(`${API_URL}/template-files/generate-base/${templateType}`);
            if (!response.ok) throw new Error("Failed to generate base template");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `base_template_${templateType}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
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
            setError(null);
            setSuccess(null);

            const response = await fetch(`${API_URL}/template-files/validate-upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.error || 'Failed to validate template.');
            } else {
                setSuccess(`Custom Template successfully uploaded for ${templateType}!`);
            }
        } catch (e) {
            setError('Network error while uploading template.');
        } finally {
            setUploadingState(prev => ({ ...prev, [templateType]: false }));
            e.target.value = '';
        }
    };

    if (viewingRegistry) {
        return <PlaceholderRegistry onClose={() => setViewingRegistry(false)} />;
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">System Settings</h1>
                    <p className="text-lg text-gray-500">Manage multiple company profiles, branding, and document templates.</p>
                </div>
                <button
                    onClick={() => setEditingCompanyId(null)}
                    className="inline-flex items-center px-5 py-2.5 bg-brand text-white rounded-xl shadow-lg hover:shadow-brand/20 transition-all font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Company
                </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {companies.map((company) => (
                    <div 
                        key={company.id} 
                        className={`relative group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            editingCompanyId === company.id 
                                ? 'bg-white border-brand shadow-xl' 
                                : 'bg-white/50 border-gray-100 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => setEditingCompanyId(company.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border shadow-inner">
                                    {company.logo_url ? (
                                        <img src={`${API_URL.replace('/api', '')}${company.logo_url}`} alt="L" className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!company.is_active && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); switchCompany(company.id); }}
                                            className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors"
                                            title="Set Active"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Profile"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{company.company_name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{company.company_code}</span>
                                {company.is_active === 1 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 uppercase">Active</span>
                                )}
                            </div>
                        </div>
                        <div className="h-1.5 w-full" style={{ backgroundColor: company.profile_color }} />
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCompanyId ? `Edit Profile: ${companies.find(c => c.id === editingCompanyId)?.company_name}` : 'Create New Profile'}
                            </h2>
                            <p className="text-xs text-gray-500">Configure branding, financials and document templates.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-6 py-2.5 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all font-bold disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-2xl text-sm flex items-start border border-red-100 animate-in fade-in zoom-in duration-200">
                            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 bg-green-50 text-green-700 p-4 rounded-2xl text-sm flex items-start border border-green-100 animate-in fade-in zoom-in duration-200">
                            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-12">
                        {/* Section 1: Identity */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Identity & Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Company Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company_name || ''}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                        placeholder="e.g. My Awesome Company Pte Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Doc Code (Prefix)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        value={formData.company_code || ''}
                                        onChange={(e) => setFormData({ ...formData, company_code: e.target.value.toUpperCase() })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50 font-bold tracking-widest"
                                        placeholder="e.g. MAC"
                                    />
                                    <p className="mt-2 text-[10px] text-gray-400 italic font-medium px-1">Used in numbering: INV-MAC26-0001</p>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">UEN Number</label>
                                    <input
                                        type="text"
                                        value={formData.UEN || ''}
                                        onChange={(e) => setFormData({ ...formData, UEN: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Profile Theme Color</label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden flex items-center p-1 px-3">
                                            <input
                                                type="color"
                                                value={formData.profile_color || '#0f172a'}
                                                onChange={(e) => setFormData({ ...formData, profile_color: e.target.value })}
                                                className="w-10 h-8 border-none bg-transparent cursor-pointer rounded overflow-hidden"
                                            />
                                            <span className="ml-3 font-mono text-sm uppercase font-bold text-gray-600">{formData.profile_color}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Full Business Address</label>
                                    <textarea
                                        rows={2}
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Financials */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Banking & Payments</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Bank Name</label>
                                    <input
                                        type="text"
                                        value={formData.bank_name || ''}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Account Name</label>
                                    <input
                                        type="text"
                                        value={formData.account_name || ''}
                                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Account Number</label>
                                    <input
                                        type="text"
                                        value={formData.account_number || ''}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand focus:ring-brand px-4 py-3 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Visual Assets */}
                        {editingCompanyId && (
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Branding Assets</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50/50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center">
                                        <p className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Company Logo</p>
                                        <div className="h-32 w-48 mb-6 flex items-center justify-center bg-white rounded-xl shadow-inner border overflow-hidden">
                                            {formData.logo_url ? (
                                                <img src={`${API_URL.replace('/api', '')}${formData.logo_url}`} alt="L" className="h-full w-full object-contain p-4" />
                                            ) : (
                                                <Building2 className="h-10 w-10 text-gray-200" />
                                            )}
                                        </div>
                                        <label className="w-full flex justify-center items-center px-4 py-3 bg-white border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all rounded-xl cursor-pointer font-bold shadow-sm">
                                            <UploadCloud className="w-5 h-5 mr-3" />
                                            Upload Logo
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        </label>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center">
                                        <p className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">PayNow QR Code</p>
                                        <div className="h-32 w-32 mb-6 flex items-center justify-center bg-white rounded-xl shadow-inner border overflow-hidden">
                                            {formData.paynow_qr_url ? (
                                                <img src={`${API_URL.replace('/api', '')}${formData.paynow_qr_url}`} alt="Q" className="h-full w-full object-contain p-2" />
                                            ) : (
                                                <div className="text-gray-200 text-xs font-bold uppercase">No QR</div>
                                            )}
                                        </div>
                                        <label className="w-full flex justify-center items-center px-4 py-3 bg-white border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all rounded-xl cursor-pointer font-bold shadow-sm">
                                            <UploadCloud className="w-5 h-5 mr-3" />
                                            Upload QR Code
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'qr')} />
                                        </label>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section 4: Document Templates (Scoped to Active Company) */}
                        {editingCompanyId && companies.find(c => c.id === editingCompanyId)?.is_active === 1 && (
                            <section className="bg-brand/5 rounded-3xl p-8 border border-brand/10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Document Templates</h3>
                                        <p className="text-sm text-gray-500">Managed for the currently active profile.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setViewingRegistry(true)}
                                        className="inline-flex items-center px-5 py-2.5 bg-white text-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all font-bold border"
                                    >
                                        <FileCode2 className="w-5 h-5 mr-2" />
                                        Placeholder Registry
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {['quotation', 'invoice', 'delivery_order'].map((type) => (
                                        <div key={type} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group">
                                            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-4">
                                                <FileCode2 className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 capitalize mb-1">{type.replace('_', ' ')}</h4>
                                            <p className="text-[10px] text-gray-400 mb-6 font-medium uppercase tracking-widest">Custom DOCX</p>
                                            
                                            <div className="space-y-3">
                                                <label className={`w-full flex justify-center items-center px-4 py-2 bg-brand text-white rounded-lg shadow-sm hover:opacity-90 transition-all font-bold text-xs cursor-pointer ${uploadingState[type] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <UploadCloud className="w-4 h-4 mr-2" />
                                                    {uploadingState[type] ? 'Uploading...' : 'Upload DOCX'}
                                                    <input type="file" className="hidden" accept=".docx" onChange={(e) => handleTemplateUpload(e, type)} disabled={uploadingState[type]} />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadBaseTemplate(type)}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-white transition-all font-bold text-xs"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Base
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {editingCompanyId && companies.find(c => c.id === editingCompanyId)?.is_active === 0 && (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <p className="text-sm text-amber-700 font-medium">To manage Document Templates for this company, please <strong>activate</strong> it first using the switcher in the sidebar.</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
