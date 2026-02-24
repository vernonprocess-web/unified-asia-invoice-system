import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from './types'

import settingsApp from './routes/settings'
import customersApp from './routes/customers'
import productsApp from './routes/products'
import quotationsApp from './routes/quotations'
import invoicesApp from './routes/invoices'
import deliveryOrdersApp from './routes/delivery_orders'
import statementsApp from './routes/statements'
import filesApp from './routes/files'
import documentTemplatesApp from './routes/document_templates'
import templateFilesApp from './routes/template_files'
import placeholdersApp from './routes/placeholders'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/api/health', (c) => {
    return c.json({ status: 'ok', message: 'API is running' })
})

app.route('/api/settings', settingsApp)
app.route('/api/customers', customersApp)
app.route('/api/products', productsApp)
app.route('/api/quotations', quotationsApp)
app.route('/api/invoices', invoicesApp)
app.route('/api/delivery-orders', deliveryOrdersApp)
app.route('/api/statements', statementsApp)
app.route('/api/files', filesApp)
app.route('/api/document-templates', documentTemplatesApp)
app.route('/api/template-files', templateFilesApp)
app.route('/api/placeholders', placeholdersApp)

export default app
