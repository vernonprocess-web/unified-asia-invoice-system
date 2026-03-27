PRAGMA foreign_keys=OFF;

-- Quotations
ALTER TABLE quotations ADD COLUMN is_gst_applicable INTEGER DEFAULT 0;
ALTER TABLE quotations ADD COLUMN gst_amount REAL DEFAULT 0.00;

-- Invoices
ALTER TABLE invoices ADD COLUMN is_gst_applicable INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN gst_amount REAL DEFAULT 0.00;

PRAGMA foreign_keys=ON;
