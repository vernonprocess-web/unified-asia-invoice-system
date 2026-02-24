import { Hono } from 'hono'
import { Bindings } from '../types'
import { generateDocumentNumber } from '../utils'

const invoicesApp = new Hono<{ Bindings: Bindings }>()

invoicesApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare(`
    SELECT i.*, c.customer_name 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    ORDER BY i.id DESC
  `).all()
    return c.json(results)
})

invoicesApp.get('/:id', async (c) => {
    const id = c.req.param('id')
    const invoice = await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first()
    if (!invoice) return c.notFound()

    const { results: items } = await c.env.DB.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').bind(id).all()
    return c.json({ ...invoice, items })
})

invoicesApp.post('/', async (c) => {
    const body = await c.req.json()
    const { quotation_id, customer_id, issue_date, due_date, payment_terms, subtotal, total, notes, items, project_name } = body

    try {
        const invoice_number = await generateDocumentNumber(c.env, 'INV', 'invoice')

        // Insert invoice
        const { results } = await c.env.DB.prepare(
            `INSERT INTO invoices (invoice_number, quotation_id, customer_id, issue_date, due_date, payment_terms, subtotal, total, notes, project_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(invoice_number, quotation_id || null, customer_id, issue_date, due_date, payment_terms, subtotal, total, notes, project_name || null).all()

        const invoiceId = results[0].id

        // Insert items using batch
        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, amount) 
         VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(invoiceId, item.product_id, item.description, item.quantity, item.unit_price, item.amount)
        })

        if (statements.length > 0) {
            await c.env.DB.batch(statements)
        }

        return c.json({ success: true, id: invoiceId, invoice_number })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

invoicesApp.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { quotation_id, customer_id, issue_date, due_date, payment_terms, subtotal, total, notes, items, project_name } = body

    try {
        await c.env.DB.prepare(
            `UPDATE invoices 
       SET quotation_id = ?, customer_id = ?, issue_date = ?, due_date = ?, payment_terms = ?, subtotal = ?, total = ?, notes = ?, project_name = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
        ).bind(quotation_id || null, customer_id, issue_date, due_date, payment_terms, subtotal, total, notes, project_name || null, id).run()

        // Replace items
        await c.env.DB.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').bind(id).run()

        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, amount) 
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

invoicesApp.delete('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        await c.env.DB.batch([
            c.env.DB.prepare('UPDATE delivery_orders SET invoice_id = NULL WHERE invoice_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM invoices WHERE id = ?').bind(id)
        ])
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

invoicesApp.post('/:id/pdf', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `invoice-${id}-${Date.now()}.pdf`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: 'application/pdf' }
    })

    const pdf_url = `/api/files/${key}`
    await c.env.DB.prepare('UPDATE invoices SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(pdf_url, id).run()

    return c.json({ pdf_url })
})

export default invoicesApp
