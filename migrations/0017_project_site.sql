-- Add project_name to quotations
ALTER TABLE quotations ADD COLUMN project_name TEXT;

-- Update placeholder_registry for project_name to support quotations
UPDATE placeholder_registry 
SET template_types_allowed = '["quotation", "invoice", "delivery_order"]' 
WHERE placeholder_name = 'project_name';
