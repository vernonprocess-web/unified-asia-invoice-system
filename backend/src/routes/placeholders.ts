import { Hono } from 'hono';
import { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

// GET all registry placeholders
app.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM placeholder_registry ORDER BY placeholder_name ASC`
        ).all();
        return c.json(results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// POST to add new placeholder
app.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed } = body;

        await c.env.DB.prepare(
            `INSERT INTO placeholder_registry (placeholder_name, display_name, data_source_table, data_source_field, template_types_allowed)
             VALUES (?, ?, ?, ?, ?)`
        ).bind(
            placeholder_name,
            display_name,
            data_source_table,
            data_source_field,
            typeof template_types_allowed === 'object' ? JSON.stringify(template_types_allowed) : template_types_allowed
        ).run();

        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
