-- Add company identity fields
ALTER TABLE company_settings ADD COLUMN company_code TEXT DEFAULT 'UA';
ALTER TABLE company_settings ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0;
ALTER TABLE company_settings ADD COLUMN profile_color TEXT DEFAULT '#0f172a';

-- Mark existing company as active
UPDATE company_settings SET is_active = 1, company_code = 'UA' WHERE id = 1;

-- Sequences are now keyed by (company_id, seq_type, year)
DROP TABLE IF EXISTS sequences;
CREATE TABLE sequences (
  id         TEXT    NOT NULL,       -- 'quotation', 'invoice', 'delivery_order'
  company_id INTEGER NOT NULL,      -- FK to company_settings.id
  last_value INTEGER NOT NULL DEFAULT 0,
  year       TEXT    NOT NULL,
  PRIMARY KEY (id, company_id),
  FOREIGN KEY (company_id) REFERENCES company_settings(id)
);

-- Template files now belong to a company
ALTER TABLE document_template_files ADD COLUMN company_id INTEGER REFERENCES company_settings(id);

-- Assign all existing uploaded templates to Company 1 (Unified Asia)
UPDATE document_template_files SET company_id = 1 WHERE company_id IS NULL;
