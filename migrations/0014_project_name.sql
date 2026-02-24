ALTER TABLE invoices ADD COLUMN project_name TEXT;
ALTER TABLE delivery_orders ADD COLUMN project_name TEXT;

INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('project_name', 'Project / Site Name', 'system', 'project_name', '["invoice", "delivery_order"]');
