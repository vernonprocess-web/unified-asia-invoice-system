import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';

export interface Company {
    id: number;
    company_name: string;
    company_code: string;
    UEN: string | null;
    address: string | null;
    email: string | null;
    logo_url: string | null;
    bank_name: string | null;
    account_name: string | null;
    account_number: string | null;
    paynow_qr_url: string | null;
    profile_color: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

interface CompanyContextType {
    companies: Company[];
    activeCompany: Company | null;
    loading: boolean;
    switchCompany: (id: number) => Promise<void>;
    refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.get('/settings');
            setCompanies(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch companies:', e);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const switchCompany = async (id: number) => {
        try {
            await api.post(`/settings/${id}/activate`, {});
            await refreshCompanies();
        } catch (e) {
            console.error('Failed to switch company:', e);
            throw e;
        }
    };

    useEffect(() => {
        refreshCompanies();
    }, []);

    const activeCompany = companies.find(c => c.is_active === 1) || null;

    return (
        <CompanyContext.Provider value={{ companies, activeCompany, loading, switchCompany, refreshCompanies }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
