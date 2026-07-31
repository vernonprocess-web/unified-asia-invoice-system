-- Add po_reference to invoices table
ALTER TABLE invoices ADD COLUMN po_reference TEXT;

-- Register po_reference placeholder
INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed)
VALUES ('po_reference', 'PO Reference Number', 'system', 'po_reference', '["invoice"]');
