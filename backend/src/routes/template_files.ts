import { Hono } from 'hono';
import { Bindings } from '../types';
import { extractPlaceholders, validatePlaceholders, replacePlaceholders } from '../services/placeholderService';
import { generateBaseTemplateContent } from '../services/templateGeneratorService';
import { numberToWords } from '../utils/numberToWords';

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const formatted = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
        return formatted.replace(/ /g, '-');
    } catch {
        return dateString;
    }
};

const app = new Hono<{ Bindings: Bindings }>();

// GET uploaded template info by type
app.get('/:type', async (c) => {
    try {
        const type = c.req.param('type');
        const templateFile = await c.env.DB.prepare(
            `SELECT * FROM document_template_files WHERE template_type = ? ORDER BY id DESC`
        ).bind(type).first();

        return c.json(templateFile || null);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Generate a BASE template natively via 'docx' package
app.get('/generate-base/:type', async (c) => {
    try {
        const type = c.req.param('type');
        const buffer = await generateBaseTemplateContent(type);

        c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        c.header('Content-Disposition', `attachment; filename="base_template_${type}.docx"`);
        return c.body(buffer as any);
    } catch (e: any) {
        console.error("Base Template Generation Error", e);
        return c.json({ error: e.message || 'Error generating base template' }, 500);
    }
});

// Upload and validate DOCX template
app.post('/validate-upload', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];
        const templateType = body['template_type'];

        if (!file || !(file instanceof File)) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        if (!file.name.endsWith('.docx')) {
            return c.json({ error: 'Invalid DOCX template file. Please upload a valid Microsoft Word template.' }, 400);
        }

        const buffer = await file.arrayBuffer();
        if (buffer.byteLength > 5 * 1024 * 1024) {
            return c.json({ error: 'Max file size is 5MB.' }, 400);
        }

        let extractedPlaceholders: string[];
        try {
            extractedPlaceholders = await extractPlaceholders(buffer);
        } catch (e) {
            return c.json({ error: 'Invalid DOCX template file. System could not parse the document structure.' }, 400);
        }

        const validationResults = await validatePlaceholders(c.env, extractedPlaceholders);

        const errors = validationResults.filter(r => !r.valid);
        if (errors.length > 0) {
            return c.json({
                error: 'Template validation failed. Invalid placeholders found.',
                details: errors
            }, 400);
        }

        // Add to R2 storage
        const objectName = `templates/${templateType}-${Date.now()}.docx`;
        await c.env.BUCKET.put(objectName, buffer);
        const fileUrl = `/api/files/${objectName}`;

        // Save DB metadata
        const result = await c.env.DB.prepare(
            `INSERT INTO document_template_files (template_type, file_url, file_name, file_type) VALUES (?, ?, ?, 'docx') RETURNING *`
        ).bind(templateType as string, fileUrl, file.name).first();

        return c.json({ message: 'Template successfully uploaded and validated', template: result });

    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Preview endpoint
app.post('/preview/:type', async (c) => {
    try {
        const type = c.req.param('type');
        const body = await c.req.json();
        const { documentData, customer, items, settings } = body;

        // Fetch latest template from DB
        const templateRecord = await c.env.DB.prepare(
            `SELECT * FROM document_template_files WHERE template_type = ? ORDER BY id DESC`
        ).bind(type).first<{ file_url: string, file_name: string }>();

        if (!templateRecord) {
            return c.json({ error: 'No custom template found for ' + type }, 404);
        }

        // Fetch the file from R2
        const objectName = templateRecord.file_url.replace('/api/files/', '');
        const object = await c.env.BUCKET.get(objectName);
        if (!object) {
            return c.json({ error: 'Template file not found in storage' }, 404);
        }

        const docxBuffer = await object.arrayBuffer();

        // Format items table integers to 2 decimal places explicitly
        const formattedItems = (items || []).map((item: any) => ({
            ...item,
            quantity: Number(item.quantity || 0).toFixed(2),
            unit_price: type === 'delivery_order' ? '' : Number(item.unit_price || 0).toFixed(2),
            amount: type === 'delivery_order' ? '' : Number(item.amount || 0).toFixed(2)
        }));

        // 1. Construct flattened context mapping based on rules
        const dataContext: any = {
            // System
            document_number: documentData.quotation_number || documentData.invoice_number || documentData.do_number || 'DOC-PREVIEW-1234',
            document_date: formatDate(documentData.issue_date || documentData.delivery_date || '2026-02-23'),
            quotation_date: formatDate(documentData.issue_date || '2026-02-23'),
            invoice_date: formatDate(documentData.issue_date || '2026-02-23'),
            validity_date: formatDate(documentData.expiry_date || '2026-03-01'),
            due_date: formatDate(documentData.due_date || '2026-03-25'),
            delivery_date: formatDate(documentData.delivery_date || '2026-02-24'),
            delivery_order_number: documentData.do_number || 'DO-PREVIEW-1234',
            delivery_address: documentData.delivery_address || '',
            project_name: documentData.project_name || '',
            contact_person: documentData.contact_person || '',
            contact_phone: documentData.contact_phone || '',
            validity_days: `${documentData.validity_days ?? 7} Days`,
            items_table: formattedItems, // docxtemplater natively supports arrays for loops over tables via {#items_table}...{/items_table}
            subtotal: type === 'delivery_order' ? '' : Number(documentData.total || 0).toFixed(2),
            total: type === 'delivery_order' ? '' : Number(documentData.total || 0).toFixed(2),
            total_in_words: type === 'delivery_order' ? '' : numberToWords(documentData.total || 0),
            payment_term: documentData.payment_terms || '',
            signature: 'Authorized Signature',

            // Customer
            customer_name: customer.customer_name || 'Preview Customer',
            customer_company: customer.company_name || 'Preview Corp',
            customer_address: customer.billing_address || '123 Preview St',
            customer_email: customer.email || 'customer@preview.com',

            // Company
            company_name: settings.company_name || 'Your Company Pte Ltd',
            company_uen: settings.UEN || '123456789X',
            company_address: settings.address || '',
            company_email: settings.email || '',
            company_logo: settings.logo_url || ''
        };

        // 2. Perform Placeholders Replacement
        const populatedDocxBuffer = await replacePlaceholders(docxBuffer, dataContext);

        // Return DOCX stream directly (Bypassing PDF Conversion)
        c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        c.header('Content-Disposition', `attachment; filename="preview_${type}.docx"`);
        return c.body(populatedDocxBuffer as any);

    } catch (e: any) {
        console.error("Preview Generation Error", e);
        return c.json({ error: e.message || 'Error generating preview' }, 500);
    }
});

export default app;
