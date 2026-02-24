import { useEffect, useState } from 'react';
import { api } from '../api';
import { X } from 'lucide-react';

export const PlaceholderRegistry = ({ onClose }: { onClose: () => void }) => {
    const [placeholders, setPlaceholders] = useState<any[]>([]);

    useEffect(() => {
        loadPlaceholders();
    }, []);

    const loadPlaceholders = async () => {
        try {
            const data = await api.get('/placeholders');
            setPlaceholders(data);
        } catch (e) {
            console.error("Failed to load placeholders", e);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col h-screen">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Placeholder Registry</h2>
                    <p className="text-sm text-gray-500">The authoritative list of supported mapping fields for your custom DOCX templates.</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto bg-white shadow-sm border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Placeholder Tag</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Display Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Source (Table.Field)</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Supported In</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {placeholders.map((p) => {
                                let allowed = '';
                                try { allowed = JSON.parse(p.template_types_allowed).join(', '); }
                                catch (e) { allowed = p.template_types_allowed; }

                                return (
                                    <tr key={p.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-brand font-mono">
                                            {'{{' + p.placeholder_name + '}}'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{p.display_name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                                            {p.data_source_table}.{p.data_source_field}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                            {allowed.replace(/_/g, ' ')}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
