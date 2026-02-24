-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_type TEXT NOT NULL UNIQUE, -- 'quotation', 'invoice', 'delivery_order'
    template_name TEXT NOT NULL,
    font_family TEXT DEFAULT 'Inter',
    header_font_size INTEGER DEFAULT 24,
    body_font_size INTEGER DEFAULT 10,
    table_font_size INTEGER DEFAULT 9,
    footer_font_size INTEGER DEFAULT 9,
    logo_position TEXT DEFAULT 'right', -- 'left', 'center', 'right'
    logo_size INTEGER DEFAULT 100,
    show_logo BOOLEAN DEFAULT 1,
    show_signature BOOLEAN DEFAULT 1,
    show_bank_details BOOLEAN DEFAULT 1,
    margin_top INTEGER DEFAULT 40,
    margin_bottom INTEGER DEFAULT 40,
    margin_left INTEGER DEFAULT 40,
    margin_right INTEGER DEFAULT 40,
    layout_config TEXT, -- JSON holding specific layout overrides
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default Quotation Template
INSERT OR IGNORE INTO document_templates (
    template_type, template_name, layout_config
) VALUES (
    'quotation', 
    'Standard Quotation', 
    '{"bankDetails":false,"signatureText":"Authorized Signature (Quotation)"}'
);

-- Seed default Invoice Template
INSERT OR IGNORE INTO document_templates (
    template_type, template_name, layout_config
) VALUES (
    'invoice', 
    'Standard Tax Invoice', 
    '{"bankDetails":true,"signatureText":"Authorized Signature"}'
);

-- Seed default Delivery Order Template
INSERT OR IGNORE INTO document_templates (
    template_type, template_name, layout_config
) VALUES (
    'delivery_order', 
    'Standard Delivery Order', 
    '{"bankDetails":false,"signatureText":"Received by / Date","hidePricing":true}'
);
