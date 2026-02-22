import { Hono } from 'hono'
import { Bindings } from '../types'
import { generateDocumentNumber } from '../utils'

const quotationsApp = new Hono<{ Bindings: Bindings }>()

quotationsApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare(`
    SELECT q.*, c.customer_name 
    FROM quotations q 
    LEFT JOIN customers c ON q.customer_id = c.id 
    ORDER BY q.id DESC
  `).all()
    return c.json(results)
})

quotationsApp.get('/:id', async (c) => {
    const id = c.req.param('id')
    const quotation = await c.env.DB.prepare('SELECT * FROM quotations WHERE id = ?').bind(id).first()
    if (!quotation) return c.notFound()

    const { results: items } = await c.env.DB.prepare('SELECT * FROM quotation_items WHERE quotation_id = ?').bind(id).all()
    return c.json({ ...quotation, items })
})

quotationsApp.post('/', async (c) => {
    const body = await c.req.json()
    const { customer_id, issue_date, expiry_date, subtotal, total, notes, items } = body

    try {
        const quotation_number = await generateDocumentNumber(c.env, 'Q', 'quotation')

        // Insert quotation
        const { results } = await c.env.DB.prepare(
            `INSERT INTO quotations (quotation_number, customer_id, issue_date, expiry_date, subtotal, total, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(quotation_number, customer_id, issue_date, expiry_date, subtotal, total, notes).all()

        const quotationId = results[0].id

        // Insert items using batch
        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, amount) 
         VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(quotationId, item.product_id, item.description, item.quantity, item.unit_price, item.amount)
        })

        if (statements.length > 0) {
            await c.env.DB.batch(statements)
        }

        return c.json({ success: true, id: quotationId, quotation_number })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

quotationsApp.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { customer_id, issue_date, expiry_date, subtotal, total, notes, items } = body

    try {
        await c.env.DB.prepare(
            `UPDATE quotations 
       SET customer_id = ?, issue_date = ?, expiry_date = ?, subtotal = ?, total = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
        ).bind(customer_id, issue_date, expiry_date, subtotal, total, notes, id).run()

        // Replace items
        await c.env.DB.prepare('DELETE FROM quotation_items WHERE quotation_id = ?').bind(id).run()

        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, amount) 
         VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(id, item.product_id, item.description, item.quantity, item.unit_price, item.amount)
        })

        if (statements.length > 0) {
            await c.env.DB.batch(statements)
        }

        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

quotationsApp.delete('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        await c.env.DB.batch([
            c.env.DB.prepare('UPDATE invoices SET quotation_id = NULL WHERE quotation_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM quotation_items WHERE quotation_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM quotations WHERE id = ?').bind(id)
        ])
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

quotationsApp.post('/:id/pdf', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `quotation-${id}-${Date.now()}.pdf`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: 'application/pdf' }
    })

    const pdf_url = `/api/files/${key}`
    await c.env.DB.prepare('UPDATE quotations SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(pdf_url, id).run()

    return c.json({ pdf_url })
})

export default quotationsApp
