-- Add total_in_words placeholder to the registry
INSERT OR IGNORE INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed) VALUES
('total_in_words', 'Total in Words (SGD)', 'system', 'total_in_words', '["quotation", "invoice"]');
