import { Hono } from 'hono'
import { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// Get all document templates
app.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM document_templates ORDER BY id ASC`
        ).all()
        return c.json(results)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// Get a specific document template by type
app.get('/:type', async (c) => {
    try {
        const type = c.req.param('type')
        const template = await c.env.DB.prepare(
            `SELECT * FROM document_templates WHERE template_type = ?`
        ).bind(type).first()

        if (!template) {
            return c.json({ error: 'Template not found' }, 404)
        }

        return c.json(template)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// Update a specific document template by type
app.put('/:type', async (c) => {
    try {
        const type = c.req.param('type')
        const body = await c.req.json()

        const {
            font_family,
            header_font_size,
            body_font_size,
            table_font_size,
            footer_font_size,
            logo_position,
            logo_size,
            show_logo,
            show_signature,
            show_bank_details,
            margin_top,
            margin_bottom,
            margin_left,
            margin_right,
            layout_config
        } = body

        // Check if template exists
        const existing = await c.env.DB.prepare(
            `SELECT id FROM document_templates WHERE template_type = ?`
        ).bind(type).first()

        if (!existing) {
            return c.json({ error: 'Template not found' }, 404)
        }

        // Layout config can be stringified JSON if it's an object received from frontend
        const layoutConfigStr = typeof layout_config === 'object' ? JSON.stringify(layout_config) : layout_config

        await c.env.DB.prepare(
            `UPDATE document_templates 
             SET font_family = ?, header_font_size = ?, body_font_size = ?, table_font_size = ?, footer_font_size = ?,
                 logo_position = ?, logo_size = ?, show_logo = ?, show_signature = ?, show_bank_details = ?,
                 margin_top = ?, margin_bottom = ?, margin_left = ?, margin_right = ?, layout_config = ?, updated_at = CURRENT_TIMESTAMP
             WHERE template_type = ?`
        ).bind(
            font_family, header_font_size, body_font_size, table_font_size, footer_font_size,
            logo_position, logo_size, show_logo ? 1 : 0, show_signature ? 1 : 0, show_bank_details ? 1 : 0,
            margin_top, margin_bottom, margin_left, margin_right, layoutConfigStr || null, type
        ).run()

        // Fetch and return the updated template
        const updated = await c.env.DB.prepare(
            `SELECT * FROM document_templates WHERE template_type = ?`
        ).bind(type).first()

        return c.json(updated)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

export default app
