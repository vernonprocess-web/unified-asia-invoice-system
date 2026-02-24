import { pdf } from '@react-pdf/renderer';
import { QuotationTemplate } from '../templates/quotationTemplate';
import { InvoiceTemplate } from '../templates/invoiceTemplate';
import { DeliveryOrderTemplate } from '../templates/deliveryOrderTemplate';
import { BaseTemplate } from '../templates/baseTemplate';
import { api } from '../api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

const getTemplateComponent = async (
    type: 'Quotation' | 'Tax Invoice' | 'Delivery Order' | 'Statement of Account',
    settings: any,
    documentData: any,
    customer: any,
    items: any[]
) => {
    let templateType = '';
    if (type === 'Quotation') templateType = 'quotation';
    if (type === 'Tax Invoice') templateType = 'invoice';
    if (type === 'Delivery Order') templateType = 'delivery_order';

    let templateConfig: any = null;
    if (templateType) {
        try {
            templateConfig = await api.get(`/document-templates/${templateType}`);
        } catch (e) {
            console.warn(`Could not load design config for ${templateType}, using normal defaults.`, e);
        }
    }

    if (type === 'Quotation') {
        return <QuotationTemplate settings={settings} documentData={documentData} customer={customer} items={items} templateConfig={templateConfig} />;
    } else if (type === 'Tax Invoice') {
        return <InvoiceTemplate settings={settings} documentData={documentData} customer={customer} items={items} templateConfig={templateConfig} />;
    } else if (type === 'Delivery Order') {
        return <DeliveryOrderTemplate settings={settings} documentData={documentData} customer={customer} items={items} templateConfig={templateConfig} />;
    } else {
        // Statement of Account fallback
        const statementColumns = [
            { label: 'Date', key: 'issue_date', width: '20%' },
            { label: 'Document', key: 'invoice_number', width: '40%' },
            { label: 'Amount', key: 'total', width: '40%', align: 'right' }
        ];
        const defaultConfig = {
            font_family: 'Helvetica',
            header_font_size: 24,
            body_font_size: 10,
            table_font_size: 9,
            footer_font_size: 9,
            logo_position: 'right',
            logo_size: 100,
            show_logo: true,
            show_signature: true,
            show_bank_details: true,
            margin_top: 40, margin_bottom: 40, margin_left: 40, margin_right: 40,
            layout_config: { signatureText: 'Authorised Signature', bankDetails: true }
        };
        return <BaseTemplate type={type} settings={settings} documentData={documentData} customer={customer} items={items} templateConfig={defaultConfig as any} columns={statementColumns} totalLabel="Total Invoiced" totalValue={documentData.totalInvoiced} />;
    }
};

export const generateAndUploadPDF = async (
    type: 'Quotation' | 'Tax Invoice' | 'Delivery Order' | 'Statement of Account',
    settings: any,
    documentData: any,
    customer: any,
    items: any[],
    endpoint: string
) => {
    try {
        let templateType = '';
        if (type === 'Quotation') templateType = 'quotation';
        if (type === 'Tax Invoice') templateType = 'invoice';
        if (type === 'Delivery Order') templateType = 'delivery_order';

        // Check if there is an active custom DOCX template uploaded
        if (templateType) {
            try {
                const uploadedRes = await fetch(`${API_URL}/template-files/${templateType}`);
                const uploadedData = await uploadedRes.json();

                if (uploadedRes.ok && uploadedData && uploadedData.id) {
                    // Intercept standard PDF generation and trigger DOCX download instead
                    const payload = { templateType, settings: settings || {}, documentData: documentData || {}, customer: customer || {}, items: items || [] };
                    const docxRes = await fetch(`${API_URL}/template-files/preview/${templateType}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (docxRes.ok) {
                        const blob = await docxRes.blob();
                        const finalBlob = new Blob([blob], { type: 'application/octet-stream' });
                        const url = window.URL.createObjectURL(finalBlob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        let refNumber = '';
                        if (type === 'Quotation') refNumber = documentData.quotation_number;
                        if (type === 'Tax Invoice') refNumber = documentData.invoice_number;
                        if (type === 'Delivery Order') refNumber = documentData.do_number;
                        const filenameStr = refNumber ? `${type.replace('Tax ', '')}-${refNumber}.docx` : `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`;

                        a.download = filenameStr;
                        a.setAttribute('download', filenameStr);
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }, 10000);

                        // We return null to indicate a physical file was downloaded, not uploaded
                        return null;
                    } else {
                        const errData = await docxRes.json().catch(() => ({}));
                        const errText = errData.error || await docxRes.text();
                        console.error("Backend failed DOCX generation:", errText);
                        alert(`DOCX Generation Error: ${errText}`);
                        return null; // Stop the PDF generation fallback if DOCX explicitly failed
                    }
                }
            } catch (err) {
                console.error("Failed to intercept DOCX template", err);
            }
        }

        const doc = await getTemplateComponent(type, settings, documentData, customer, items);
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        let refNumber = '';
        if (type === 'Quotation') refNumber = documentData.quotation_number;
        if (type === 'Tax Invoice') refNumber = documentData.invoice_number;
        if (type === 'Delivery Order') refNumber = documentData.do_number;
        const filenameStr = refNumber ? `${type.replace('Tax ', '')}-${refNumber}.pdf` : `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;

        // Create a file from blob
        const file = new File([blob], filenameStr, { type: 'application/pdf' });

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
        let templateType = '';
        if (type === 'Quotation') templateType = 'quotation';
        if (type === 'Tax Invoice') templateType = 'invoice';
        if (type === 'Delivery Order') templateType = 'delivery_order';

        // Check if there is an active custom DOCX template uploaded
        if (templateType) {
            try {
                const uploadedRes = await fetch(`${API_URL}/template-files/${templateType}`);
                const uploadedData = await uploadedRes.json();

                if (uploadedRes.ok && uploadedData && uploadedData.id) {
                    // Intercept standard PDF generation and trigger DOCX download instead
                    const payload = { templateType, settings: settings || {}, documentData: documentData || {}, customer: customer || {}, items: items || [] };
                    const docxRes = await fetch(`${API_URL}/template-files/preview/${templateType}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (docxRes.ok) {
                        const blob = await docxRes.blob();
                        const finalBlob = new Blob([blob], { type: 'application/octet-stream' });
                        const url = window.URL.createObjectURL(finalBlob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        let refNumber = '';
                        if (type === 'Quotation') refNumber = documentData.quotation_number;
                        if (type === 'Tax Invoice') refNumber = documentData.invoice_number;
                        if (type === 'Delivery Order') refNumber = documentData.do_number;
                        const filenameStr = refNumber ? `${type.replace('Tax ', '')}-${refNumber}.docx` : `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`;

                        a.download = filenameStr;
                        a.setAttribute('download', filenameStr);
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }, 10000);
                        return;
                    } else {
                        const errData = await docxRes.json().catch(() => ({}));
                        const errText = errData.error || await docxRes.text();
                        console.error("Backend failed DOCX generation:", errText);
                        alert(`DOCX Generation Error: ${errText}`);
                        return; // Stop the PDF generation fallback if DOCX explicitly failed
                    }
                }
            } catch (err) {
                console.error("Failed to intercept DOCX template", err);
            }
        }

        const doc = await getTemplateComponent(type, settings, documentData, customer, items);
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();

        const finalPdfBlob = new Blob([blob], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(finalPdfBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        let refNumber = '';
        if (type === 'Quotation') refNumber = documentData.quotation_number;
        if (type === 'Tax Invoice') refNumber = documentData.invoice_number;
        if (type === 'Delivery Order') refNumber = documentData.do_number;
        const filenameStr = refNumber ? `${type.replace('Tax ', '')}-${refNumber}.pdf` : `${type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;

        a.download = filenameStr;
        a.setAttribute('download', filenameStr);
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 10000);
    } catch (err) {
        console.error('Failed to generate or download PDF:', err);
        throw err;
    }
};
