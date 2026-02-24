import { Hono } from 'hono'
import { Bindings } from '../types'
import { generateDocumentNumber } from '../utils'

const deliveryOrdersApp = new Hono<{ Bindings: Bindings }>()

deliveryOrdersApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare(`
    SELECT d.*, c.customer_name 
    FROM delivery_orders d 
    LEFT JOIN customers c ON d.customer_id = c.id 
    ORDER BY d.id DESC
  `).all()
    return c.json(results)
})

deliveryOrdersApp.get('/:id', async (c) => {
    const id = c.req.param('id')
    const deliveryOrder = await c.env.DB.prepare('SELECT * FROM delivery_orders WHERE id = ?').bind(id).first()
    if (!deliveryOrder) return c.notFound()

    const { results: items } = await c.env.DB.prepare('SELECT * FROM delivery_order_items WHERE do_id = ?').bind(id).all()
    return c.json({ ...deliveryOrder, items })
})

deliveryOrdersApp.post('/', async (c) => {
    const body = await c.req.json()
    const { invoice_id, customer_id, delivery_date, delivery_status, items, do_number: custom_do_number, delivery_address, contact_person, contact_phone, project_name } = body

    try {
        const do_number = custom_do_number || await generateDocumentNumber(c.env, 'DO', 'delivery_order')

        const { results } = await c.env.DB.prepare(
            `INSERT INTO delivery_orders (do_number, invoice_id, customer_id, delivery_date, delivery_status, delivery_address, contact_person, contact_phone, project_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(do_number, invoice_id || null, customer_id, delivery_date, delivery_status || 'Pending', delivery_address || null, contact_person || null, contact_phone || null, project_name || null).all()

        const doId = results[0].id

        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO delivery_order_items (do_id, product_id, description, quantity) 
         VALUES (?, ?, ?, ?)`
            ).bind(doId, item.product_id, item.description, item.quantity)
        })

        if (statements.length > 0) {
            await c.env.DB.batch(statements)
        }

        return c.json({ success: true, id: doId, do_number })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

deliveryOrdersApp.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { invoice_id, customer_id, delivery_date, delivery_status, items, do_number, delivery_address, contact_person, contact_phone, project_name } = body

    try {
        await c.env.DB.prepare(
            `UPDATE delivery_orders 
       SET do_number = ?, invoice_id = ?, customer_id = ?, delivery_date = ?, delivery_status = ?, delivery_address = ?, contact_person = ?, contact_phone = ?, project_name = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
        ).bind(do_number || id, invoice_id || null, customer_id, delivery_date, delivery_status || 'Pending', delivery_address || null, contact_person || null, contact_phone || null, project_name || null, id).run()

        await c.env.DB.prepare('DELETE FROM delivery_order_items WHERE do_id = ?').bind(id).run()

        const statements = items.map((item: any) => {
            return c.env.DB.prepare(
                `INSERT INTO delivery_order_items (do_id, product_id, description, quantity) 
         VALUES (?, ?, ?, ?)`
            ).bind(id, item.product_id, item.description, item.quantity)
        })

        if (statements.length > 0) {
            await c.env.DB.batch(statements)
        }

        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

deliveryOrdersApp.delete('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        await c.env.DB.batch([
            c.env.DB.prepare('DELETE FROM delivery_order_items WHERE do_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM delivery_orders WHERE id = ?').bind(id)
        ])
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

deliveryOrdersApp.post('/:id/pdf', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `do-${id}-${Date.now()}.pdf`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: 'application/pdf' }
    })

    const pdf_url = `/api/files/${key}`
    await c.env.DB.prepare('UPDATE delivery_orders SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(pdf_url, id).run()

    return c.json({ pdf_url })
})

deliveryOrdersApp.post('/:id/signature', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const file = body['file'] as File

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const key = `signature-${id}-${Date.now()}-${file.name}`
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
    })

    const signature_url = `/api/files/${key}`
    await c.env.DB.prepare('UPDATE delivery_orders SET signature_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(signature_url, id).run()

    return c.json({ signature_url })
})

export default deliveryOrdersApp
