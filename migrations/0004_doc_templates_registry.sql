CREATE TABLE IF NOT EXISTS document_template_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS placeholder_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placeholder_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    data_source_table TEXT NOT NULL,
    data_source_field TEXT NOT NULL,
    template_types_allowed TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed common placeholders
INSERT OR IGNORE INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('company_name', 'Company Name', 'company_settings', 'company_name', '["quotation", "invoice", "delivery_order"]'),
('company_uen', 'Company UEN', 'company_settings', 'UEN', '["quotation", "invoice", "delivery_order"]'),
('company_address', 'Company Address', 'company_settings', 'address', '["quotation", "invoice", "delivery_order"]'),
('company_email', 'Company Email', 'company_settings', 'email', '["quotation", "invoice", "delivery_order"]'),
('company_logo', 'Company Logo URL', 'company_settings', 'logo_url', '["quotation", "invoice", "delivery_order"]'),
('customer_name', 'Customer Name', 'customers', 'customer_name', '["quotation", "invoice", "delivery_order"]'),
('customer_company', 'Customer Company', 'customers', 'company_name', '["quotation", "invoice", "delivery_order"]'),
('customer_address', 'Customer Address', 'customers', 'billing_address', '["quotation", "invoice", "delivery_order"]'),
('customer_email', 'Customer Email', 'customers', 'email', '["quotation", "invoice", "delivery_order"]'),
('document_number', 'Document Number', 'system', 'document_number', '["quotation", "invoice", "delivery_order"]'),
('document_date', 'Document Date', 'system', 'document_date', '["quotation", "invoice", "delivery_order"]'),
('items_table', 'Items Table', 'system', 'items_table', '["quotation", "invoice", "delivery_order"]'),
('subtotal', 'Subtotal', 'system', 'subtotal', '["quotation", "invoice", "delivery_order"]'),
('total', 'Total', 'system', 'total', '["quotation", "invoice", "delivery_order"]'),
('signature', 'Signature Block', 'system', 'signature', '["quotation", "invoice", "delivery_order"]'),
('description', 'Item Description', 'items_table', 'description', '["quotation", "invoice", "delivery_order"]'),
('quantity', 'Item Quantity', 'items_table', 'quantity', '["quotation", "invoice", "delivery_order"]'),
('unit_price', 'Item Unit Price', 'items_table', 'unit_price', '["quotation", "invoice"]'),
('amount', 'Item Amount', 'items_table', 'amount', '["quotation", "invoice"]');
