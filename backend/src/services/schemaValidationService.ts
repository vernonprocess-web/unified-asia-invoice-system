import { Bindings } from '../types';

export const verifyTableExists = async (env: Bindings, tableName: string): Promise<boolean> => {
    try {
        const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
        const result = await env.DB.prepare(query).bind(tableName).first();
        return !!result;
    } catch (e) {
        console.error("Error verifying table", e);
        return false;
    }
};

export const verifyColumnExists = async (env: Bindings, tableName: string, columnName: string): Promise<boolean> => {
    try {
        const tableExists = await verifyTableExists(env, tableName);
        if (!tableExists) return false;

        // PRAGMA query
        const query = `PRAGMA table_info(${tableName})`;
        const { results } = await env.DB.prepare(query).all();

        return results.some((row: any) => row.name === columnName);
    } catch (e) {
        console.error("Error verifying column", e);
        return false;
    }
};

export const validatePlaceholderMapping = async (env: Bindings, tableName: string, columnName: string): Promise<boolean> => {
    if (tableName === 'system') return true; // System placeholders are computed dynamically
    return await verifyColumnExists(env, tableName, columnName);
};
