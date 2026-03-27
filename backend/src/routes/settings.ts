import { Hono } from 'hono'
import { Bindings } from '../types'

const settingsApp = new Hono<{ Bindings: Bindings }>()

// GET all company profiles
settingsApp.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM company_settings ORDER BY id ASC').all()
        return c.json(results)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// GET currently active company
settingsApp.get('/active', async (c) => {
    try {
        const result = await c.env.DB.prepare('SELECT * FROM company_settings WHERE is_active = 1').first()
        return c.json(result || null)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// CREATE new company profile
settingsApp.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const { company_name, company_code, UEN, address, email, bank_name, account_name, account_number, profile_color } = body

        if (!company_name || !company_code) {
            return c.json({ error: 'Company Name and Code are required' }, 400)
        }

        const result = await c.env.DB.prepare(
            `INSERT INTO company_settings 
            (company_name, company_code, UEN, address, email, bank_name, account_name, account_number, profile_color, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0) RETURNING *`
        ).bind(
            company_name, 
            company_code.toUpperCase(), 
            UEN || null, 
            address || null, 
            email || null, 
            bank_name || null, 
            account_name || null, 
            account_number || null, 
            profile_color || '#0f172a'
        ).first()

        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// UPDATE specific company profile
settingsApp.put('/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json()
        const { company_name, company_code, UEN, address, email, bank_name, account_name, account_number, profile_color } = body

        await c.env.DB.prepare(
            `UPDATE company_settings 
            SET company_name = ?, company_code = ?, UEN = ?, address = ?, email = ?, 
                bank_name = ?, account_name = ?, account_number = ?, profile_color = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`
        ).bind(
            company_name, 
            company_code.toUpperCase(), 
            UEN, 
            address, 
            email, 
            bank_name, 
            account_name, 
            account_number, 
            profile_color, 
            id
        ).run()

        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// DELETE company profile
settingsApp.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id')
        
        // Count total companies
        const counts = await c.env.DB.prepare('SELECT COUNT(*) as count FROM company_settings').first<{count: number}>()
        if (counts && counts.count <= 1) {
            return c.json({ error: 'Cannot delete the only company profile.' }, 400)
        }

        // Check if it's active
        const company = await c.env.DB.prepare('SELECT is_active FROM company_settings WHERE id = ?').bind(id).first<{is_active: number}>()
        if (company && company.is_active === 1) {
            return c.json({ error: 'Cannot delete the active company profile. Switch to another profile first.' }, 400)
        }

        await c.env.DB.prepare('DELETE FROM company_settings WHERE id = ?').bind(id).run()
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// ACTIVATE company profile
settingsApp.post('/:id/activate', async (c) => {
    try {
        const id = c.req.param('id')
        
        await c.env.DB.batch([
            c.env.DB.prepare('UPDATE company_settings SET is_active = 0'),
            c.env.DB.prepare('UPDATE company_settings SET is_active = 1 WHERE id = ?').bind(id)
        ])

        const active = await c.env.DB.prepare('SELECT * FROM company_settings WHERE id = ?').bind(id).first()
        return c.json(active)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// UPLOAD logo for specific company
settingsApp.post('/:id/logo', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.parseBody()
        const file = body['file'] as File

        if (!file) return c.json({ error: 'No file provided' }, 400)

        const key = `logo-${id}-${Date.now()}-${file.name}`
        await c.env.BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        })

        const logo_url = `/api/files/${key}`

        await c.env.DB.prepare('UPDATE company_settings SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(logo_url, id).run()

        return c.json({ logo_url })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// UPLOAD QR for specific company
settingsApp.post('/:id/qr', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.parseBody()
        const file = body['file'] as File

        if (!file) return c.json({ error: 'No file provided' }, 400)

        const key = `qr-${id}-${Date.now()}-${file.name}`
        await c.env.BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        })

        const paynow_qr_url = `/api/files/${key}`

        await c.env.DB.prepare('UPDATE company_settings SET paynow_qr_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(paynow_qr_url, id).run()

        return c.json({ paynow_qr_url })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

export default settingsApp
