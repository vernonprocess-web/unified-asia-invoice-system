ALTER TABLE delivery_orders ADD COLUMN delivery_address TEXT;
ALTER TABLE delivery_orders ADD COLUMN contact_person TEXT;
ALTER TABLE delivery_orders ADD COLUMN contact_phone TEXT;

INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('delivery_address', 'Delivery Address', 'system', 'delivery_address', '["delivery_order"]'),
('contact_person', 'Contact Person', 'system', 'contact_person', '["delivery_order"]'),
('contact_phone', 'Phone Number', 'system', 'contact_phone', '["delivery_order"]');
