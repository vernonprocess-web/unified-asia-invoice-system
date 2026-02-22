import { Hono } from 'hono'
import { Bindings } from '../types'

const productsApp = new Hono<{ Bindings: Bindings }>()

productsApp.get('/', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all()
    return c.json(results)
})

productsApp.post('/', async (c) => {
    const body = await c.req.json()
    const { product_code, name, description, SKU, unit_price, unit } = body

    try {
        const { results } = await c.env.DB.prepare(
            `INSERT INTO products (product_code, name, description, SKU, unit_price, unit) 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(product_code, name, description || null, SKU || null, unit_price, unit).all()

        return c.json({ success: true, id: results[0].id })
    } catch (e: any) {
        return c.json({ error: e.message }, 400)
    }
})

productsApp.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { product_code, name, description, SKU, unit_price, unit } = body

    await c.env.DB.prepare(
        `UPDATE products 
     SET product_code = ?, name = ?, description = ?, SKU = ?, unit_price = ?, unit = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`
    ).bind(product_code, name, description || null, SKU || null, unit_price, unit, id).run()

    return c.json({ success: true })
})

productsApp.delete('/:id', async (c) => {
    const id = c.req.param('id')
    try {
        await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ error: "Cannot delete product with existing records" }, 400)
    }
})

export default productsApp
