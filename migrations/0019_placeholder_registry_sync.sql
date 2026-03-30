-- Placeholder Registry Sync
-- This migration ensures that all available system placeholders are registered for reference and validation.

DELETE FROM placeholder_registry;

-- System & Document Fields
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES 
('document_number', 'Document Number', 'system', 'document_number', '["quotation", "invoice", "delivery_order"]'),
('document_date', 'Document Date (Formatted)', 'system', 'document_date', '["quotation", "invoice", "delivery_order"]'),
('quotation_date', 'Quotation Date', 'system', 'quotation_date', '["quotation"]'),
('invoice_date', 'Invoice Date', 'system', 'invoice_date', '["invoice"]'),
('delivery_date', 'Delivery Date', 'system', 'delivery_date', '["delivery_order"]'),
('validity_date', 'Validity Date (Expiry)', 'system', 'validity_date', '["quotation"]'),
('due_date', 'Payment Due Date', 'system', 'due_date', '["invoice"]'),
('validity_days', 'Validity Period (e.g. 7 Days)', 'system', 'validity_days', '["quotation"]'),
('payment_term', 'Payment Term', 'system', 'payment_term', '["quotation", "invoice"]'),
('project_name', 'Project / Site Name', 'system', 'project_name', '["quotation", "invoice", "delivery_order"]'),
('delivery_address', 'Delivery Address', 'system', 'delivery_address', '["delivery_order"]'),
('contact_person', 'Contact Person', 'system', 'contact_person', '["delivery_order"]'),
('contact_phone', 'Contact Phone', 'system', 'contact_phone', '["delivery_order"]'),
('signature', 'Signature Text Placeholder', 'system', 'signature', '["quotation", "invoice", "delivery_order"]');

-- Financial Fields
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES 
('subtotal', 'Subtotal (Before GST)', 'system', 'subtotal', '["quotation", "invoice"]'),
('total', 'Grand Total', 'system', 'total', '["quotation", "invoice"]'),
('gst_amount', 'GST Amount (9%)', 'system', 'gst_amount', '["quotation", "invoice"]'),
('total_in_words', 'Total Amount in Words', 'system', 'total_in_words', '["quotation", "invoice"]'),
('is_gst_applicable', 'GST Applicable Flag', 'system', 'is_gst_applicable', '["quotation", "invoice"]');

-- Items Table (Docxtemplater Loop)
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES 
('items_table', 'Items Table (Start Loop)', 'system', 'items_table', '["quotation", "invoice", "delivery_order"]'),
('description', 'Item Description (Inside Table)', 'system', 'description', '["quotation", "invoice", "delivery_order"]'),
('quantity', 'Item Quantity (Inside Table)', 'system', 'quantity', '["quotation", "invoice", "delivery_order"]'),
('unit_price', 'Item Unit Price (Inside Table)', 'system', 'unit_price', '["quotation", "invoice"]'),
('amount', 'Item Amount (Inside Table)', 'system', 'amount', '["quotation", "invoice"]');

-- Customer Details
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES 
('customer_name', 'Customer Contact Name', 'system', 'customer_name', '["quotation", "invoice", "delivery_order"]'),
('customer_company', 'Customer Company Name', 'system', 'customer_company', '["quotation", "invoice", "delivery_order"]'),
('customer_address', 'Customer Billing Address', 'system', 'customer_address', '["quotation", "invoice", "delivery_order"]'),
('customer_email', 'Customer Email', 'system', 'customer_email', '["quotation", "invoice", "delivery_order"]');

-- Company Details (Your Settings)
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES 
('company_name', 'Your Company Name', 'system', 'company_name', '["quotation", "invoice", "delivery_order"]'),
('company_uen', 'Your Company UEN', 'system', 'company_uen', '["quotation", "invoice", "delivery_order"]'),
('company_address', 'Your Company Address', 'system', 'company_address', '["quotation", "invoice", "delivery_order"]'),
('company_email', 'Your Company Email', 'system', 'company_email', '["quotation", "invoice", "delivery_order"]'),
('company_logo', 'Your Company Logo URL', 'system', 'company_logo', '["quotation", "invoice", "delivery_order"]');
