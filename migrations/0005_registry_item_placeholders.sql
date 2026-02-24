-- Seed missing item array placeholders into the registry
INSERT OR IGNORE INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('description', 'Item Description', 'items_table', 'description', '["quotation", "invoice", "delivery_order"]'),
('quantity', 'Item Quantity', 'items_table', 'quantity', '["quotation", "invoice", "delivery_order"]'),
('unit_price', 'Item Unit Price', 'items_table', 'unit_price', '["quotation", "invoice"]'),
('amount', 'Item Amount', 'items_table', 'amount', '["quotation", "invoice"]');
