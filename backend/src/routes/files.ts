import { Hono } from 'hono'
import { Bindings } from '../types'

const filesApp = new Hono<{ Bindings: Bindings }>()

filesApp.get('/:key', async (c) => {
    const key = c.req.param('key')
    const object = await c.env.BUCKET.get(key)

    if (object === null) {
        return c.notFound()
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)

    return new Response(object.body, {
        headers,
    })
})

export default filesApp
