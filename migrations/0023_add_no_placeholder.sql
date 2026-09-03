-- Add Item Number Placeholders to Registry
INSERT OR IGNORE INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('no', 'Item Row Number (1, 2, 3...)', 'system', 'no', '["quotation", "invoice", "delivery_order"]'),
('item_no', 'Item Row Number Alias (1, 2, 3...)', 'system', 'item_no', '["quotation", "invoice", "delivery_order"]');
