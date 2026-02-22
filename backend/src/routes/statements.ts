import { Hono } from 'hono'
import { Bindings } from '../types'

const statementsApp = new Hono<{ Bindings: Bindings }>()

statementsApp.get('/', async (c) => {
    const customerId = c.req.query('customer_id')
    const dateFrom = c.req.query('date_from')
    const dateTo = c.req.query('date_to')

    if (!customerId || !dateFrom || !dateTo) {
        return c.json({ error: 'Missing required parameters' }, 400)
    }

    const customer = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(customerId).first()
    if (!customer) return c.notFound()

    const { results: invoices } = await c.env.DB.prepare(
        `SELECT * FROM invoices 
     WHERE customer_id = ? AND issue_date >= ? AND issue_date <= ? 
     ORDER BY issue_date ASC`
    ).bind(customerId, dateFrom, dateTo).all()

    return c.json({
        customer,
        invoices,
        date_from: dateFrom,
        date_to: dateTo
    })
})

export default statementsApp
