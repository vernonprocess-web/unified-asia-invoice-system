import { Hono } from 'hono'
import { Bindings } from '../types'

const settingsApp = new Hono<{ Bindings: Bindings }>()

settingsApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM company_settings WHERE id = 1').all()
    return c.json(results[0] || null)
})

settingsApp.put('/', async (c) => {
    const body = await c.req.json()
    const { company_name, UEN, address, email, bank_name, account_name, account_number } = body

    await c.env.DB.prepare(
        `UPDATE company_settings 
     SET company_name = ?, UEN = ?, address = ?, email = ?, bank_name = ?, account_name = ?, account_number = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = 1`
    ).bind(company_name, UEN, address, email, bank_name, account_name, account_number).run()

    return c.json({ success: true })
})

settingsApp.post('/logo', async (c) => {
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `logo-${Date.now()}-${file.name}`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
    })

    // Note: For a real app, you would use a custom domain. Using R2.dev or similar for simplicity here,
    // or we can serve it through another worker endpoint. 
    // Let's create an endpoint to fetch files and save just the key.
    const logo_url = `/api/files/${key}`

    await c.env.DB.prepare('UPDATE company_settings SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .bind(logo_url).run()

    return c.json({ logo_url })
})

settingsApp.post('/qr', async (c) => {
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `qr-${Date.now()}-${file.name}`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
    })

    const paynow_qr_url = `/api/files/${key}`

    await c.env.DB.prepare('UPDATE company_settings SET paynow_qr_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .bind(paynow_qr_url).run()

    return c.json({ paynow_qr_url })
})

export default settingsApp
