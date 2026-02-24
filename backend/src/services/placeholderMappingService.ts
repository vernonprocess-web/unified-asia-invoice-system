import { Bindings } from '../types';
import { validatePlaceholderMapping } from './schemaValidationService';

export const getPlaceholderMapping = async (env: Bindings, placeholderName: string) => {
    return await env.DB.prepare(
        `SELECT * FROM placeholder_registry WHERE placeholder_name = ?`
    ).bind(placeholderName).first();
};

export const validateMappingAgainstSchema = async (env: Bindings, placeholderName: string) => {
    const mapping: any = await getPlaceholderMapping(env, placeholderName);
    if (!mapping) {
        return { valid: false, error: `Placeholder {{${placeholderName}}} not found in registry.` };
    }

    const isValid = await validatePlaceholderMapping(env, mapping.data_source_table, mapping.data_source_field);
    if (!isValid) {
        return {
            valid: false,
            error: `Placeholder {{${placeholderName}}} mapped to ${mapping.data_source_table}.${mapping.data_source_field} but field does not exist in database.`
        };
    }

    return { valid: true, mapping };
};

export const resolvePlaceholderValue = (mapping: any, dataContext: any) => {
    if (!mapping) return '';
    const { data_source_table, data_source_field } = mapping;

    if (data_source_table === 'system') {
        const value = dataContext.system?.[data_source_field];
        return value !== undefined && value !== null ? String(value) : '';
    }

    if (dataContext[data_source_table]) {
        const value = dataContext[data_source_table][data_source_field];
        return value !== undefined && value !== null ? String(value) : '';
    }

    return '';
};
