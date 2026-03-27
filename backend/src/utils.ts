import { Bindings } from './types'

export async function generateDocumentNumber(env: Bindings, prefix: string, seqId: string, companyId: number, companyCode: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2)
    const result = await env.DB.prepare(`
    UPDATE sequences 
    SET last_value = CASE WHEN year = ? THEN last_value + 1 ELSE 1 END,
        year = ?
    WHERE id = ? AND company_id = ?
    RETURNING last_value
  `).bind(year, year, seqId, companyId).all()

    let nextVal: number | undefined
    if (result.results && result.results.length > 0) {
        nextVal = result.results[0].last_value as number
    }

    if (nextVal === undefined) {
        await env.DB.prepare(`INSERT INTO sequences (id, company_id, last_value, year) VALUES (?, ?, 1, ?)`).bind(seqId, companyId, year).run()
        nextVal = 1
    }

    return `${prefix}${companyCode}${year}-${nextVal.toString().padStart(4, '0')}`
}
