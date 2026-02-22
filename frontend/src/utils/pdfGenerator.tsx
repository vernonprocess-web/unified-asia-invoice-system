import { pdf } from '@react-pdf/renderer';
import { DocumentTemplate } from '../templates/documentTemplate';
import { api } from '../api';
import React from 'react';

export const generateAndUploadPDF = async (
    type: 'Quotation' | 'Tax Invoice' | 'Delivery Order' | 'Statement of Account',
    settings: any,
    documentData: any,
    customer: any,
    items: any[],
    endpoint: string
) => {
    try {
        const doc = <DocumentTemplate type={type} settings={settings} documentData={documentData} customer={customer} items={items} />;
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        // Create a file from blob
        const file = new File([blob], `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`, { type: 'application/pdf' });

        // Upload it to the endpoint (e.g., /quotations/1/pdf)
        const res = await api.uploadFile(endpoint, file);
        return res.pdf_url;
    } catch (err) {
        console.error('Failed to generate or upload PDF:', err);
        throw err;
    }
};

export const generateAndDownloadPDF = async (
    type: 'Quotation' | 'Tax Invoice' | 'Delivery Order' | 'Statement of Account',
    settings: any,
    documentData: any,
    customer: any,
    items: any[]
) => {
    try {
        const doc = <DocumentTemplate type={type} settings={settings} documentData={documentData} customer={customer} items={items} />;
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to generate or download PDF:', err);
        throw err;
    }
};
