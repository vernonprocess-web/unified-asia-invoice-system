import { Hono } from 'hono'
import { Bindings } from '../types'

const customersApp = new Hono<{ Bindings: Bindings }>()

customersApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM customers ORDER BY id DESC').all()
    return c.json(results)
})

customersApp.post('/', async (c) => {
    const body = await c.req.json()
    const { customer_code, customer_name, company_name, UEN, billing_address, delivery_address, contact_person, phone, email } = body

    try {
        const { results } = await c.env.DB.prepare(
            `INSERT INTO customers (customer_code, customer_name, company_name, UEN, billing_address, delivery_address, contact_person, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(customer_code, customer_name, company_name || null, UEN || null, billing_address || null, delivery_address || null, contact_person || null, phone || null, email || null).all()

        return c.json({ success: true, id: results[0].id })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

customersApp.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { customer_code, customer_name, company_name, UEN, billing_address, delivery_address, contact_person, phone, email } = body

    await c.env.DB.prepare(
        `UPDATE customers 
     SET customer_code = ?, customer_name = ?, company_name = ?, UEN = ?, billing_address = ?, delivery_address = ?, contact_person = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`
    ).bind(customer_code, customer_name, company_name || null, UEN || null, billing_address || null, delivery_address || null, contact_person || null, phone || null, email || null, id).run()

    return c.json({ success: true })
})

customersApp.delete('/:id', async (c) => {
    const id = c.req.param('id')
    // Depending on constraints this could fail if connected to quotes/invoices
    try {
        await c.env.DB.prepare('DELETE FROM customers WHERE id = ?').bind(id).run()
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: "Cannot delete customer with existing records" }, 400)
    }
})

export default customersApp
