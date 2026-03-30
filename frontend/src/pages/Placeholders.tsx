import { useEffect, useState } from 'react';
import { api } from '../api';
import { Clipboard, CheckCircle2, Search, Info } from 'lucide-react';

interface Placeholder {
    id: number;
    placeholder_name: string;
    display_name: string;
    template_types_allowed: string | string[];
}

export default function Placeholders() {
    const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlaceholders();
    }, []);

    const loadPlaceholders = async () => {
        try {
            const data = await api.get('/placeholders');
            setPlaceholders(data);
        } catch (e) {
            console.error("Failed to load placeholders", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (name: string, id: number) => {
        const textToCopy = `{{${name}}}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPlaceholders = placeholders.filter(p => 
        p.placeholder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategories = () => {
        const categories: Record<string, Placeholder[]> = {
            'System & Dates': [],
            'Financials': [],
            'Items Table': [],
            'Customer Details': [],
            'Company Details': [],
            'Delivery & Contacts': []
        };

        filteredPlaceholders.forEach(p => {
            const name = p.placeholder_name;
            if (name.includes('company_')) categories['Company Details'].push(p);
            else if (name.includes('customer_')) categories['Customer Details'].push(p);
            else if (['items_table', 'description', 'quantity', 'unit_price', 'amount'].includes(name)) categories['Items Table'].push(p);
            else if (['subtotal', 'total', 'gst_amount', 'total_in_words', 'is_gst_applicable'].includes(name)) categories['Financials'].push(p);
            else if (['delivery_date', 'delivery_address', 'contact_person', 'contact_phone'].includes(name)) categories['Delivery & Contacts'].push(p);
            else categories['System & Dates'].push(p);
        });

        return categories;
    };

    const categories = getCategories();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Placeholder Registry</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Use these placeholders in your Microsoft Word (.docx) templates. The system will automatically replace them with real data when generating documents.
                </p>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm"
                    placeholder="Search placeholders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(categories).map(([category, items]) => (
                        items.length > 0 && (
                            <div key={category}>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{category}</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((p) => (
                                        <div key={p.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="px-4 py-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded">
                                                        {p.display_name}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(p.placeholder_name, p.id)}
                                                        className="text-gray-400 hover:text-brand transition-colors"
                                                        title="Copy placeholder"
                                                    >
                                                        {copiedId === p.id ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <Clipboard className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <code className="text-sm font-mono text-gray-800 break-all bg-gray-50 px-2 py-1 rounded block mb-2">
                                                    {`{{${p.placeholder_name}}}`}
                                                </code>
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {JSON.parse(typeof p.template_types_allowed === 'string' ? p.template_types_allowed : JSON.stringify(p.template_types_allowed)).map((type: string) => (
                                                        <span key={type} className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-300 px-1 rounded">
                                                            {type.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}

                    {filteredPlaceholders.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <Info className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No placeholders found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Tip:</strong> For the <code className="bg-blue-100 px-1 rounded">items_table</code>, use 
                            <code className="bg-blue-100 px-1 rounded ml-1">{`{{#items_table}}`}</code> to start the loop and 
                            <code className="bg-blue-100 px-1 rounded ml-1">{`{{/items_table}}`}</code> to end it. Fields like 
                            <code className="bg-blue-100 px-1 rounded ml-1">{`{{description}}`}</code> should be placed inside this loop.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
