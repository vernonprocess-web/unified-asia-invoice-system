import JSZip from 'jszip';
// @ts-ignore
import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
import { Bindings } from '../types';
import { validateMappingAgainstSchema } from './placeholderMappingService';

export const extractPlaceholders = async (docxBuffer: ArrayBuffer): Promise<string[]> => {
    const zip = await JSZip.loadAsync(docxBuffer);
    const placeholders = new Set<string>();

    const filesToScan = Object.keys(zip.files).filter(name =>
        name === 'word/document.xml' ||
        name.startsWith('word/header') ||
        name.startsWith('word/footer')
    );

    for (const fileName of filesToScan) {
        const xmlContent = await zip.files[fileName].async('string');
        // Strip XML tags to merge fragmented text runs, making regex extraction highly effective
        const textContent = xmlContent.replace(/<[^>]+>/g, '');

        const strictRegex = /\{\{([a-z0-9_#/]+)\}\}/g;
        let match;
        while ((match = strictRegex.exec(textContent)) !== null) {
            placeholders.add(match[1]);
        }

        // Also check for invalid placeholders (uppercase or spaces)
        const invalidRegex = /\{\{([^}]+)\}\}/g;
        while ((match = invalidRegex.exec(textContent)) !== null) {
            const inner = match[1];
            if (!/^[a-z0-9_#/]+$/.test(inner)) {
                // We add it to the list, the validator will catch it and reject it.
                placeholders.add(inner);
            }
        }
    }

    return Array.from(placeholders);
};

export const validatePlaceholders = async (env: Bindings, placeholders: string[]) => {
    const results = [];
    const allPlaceholdersQ = await env.DB.prepare(`SELECT placeholder_name FROM placeholder_registry`).all();
    const allNames = allPlaceholdersQ.results.map((r: any) => r.placeholder_name as string);

    for (let p of placeholders) {
        if (!/^[a-z0-9_#/]+$/.test(p)) {
            // Fails regex validation
            results.push({
                placeholder: p,
                valid: false,
                error: `Invalid placeholder format: {{${p}}}. Must be lowercase snake_case without spaces.`,
                suggestion: ''
            });
            continue;
        }

        // Clean out # or / prefixes before DB check (e.g. #items_table -> items_table)
        p = p.replace(/^#/, '').replace(/^\//, '');

        // Whitelist array-level properties which aren't in the top-level scalar mapping schema
        const arrayProperties = ['items_table', 'description', 'quantity', 'unit_price', 'amount'];
        if (arrayProperties.includes(p)) {
            results.push({ placeholder: p, valid: true });
            continue;
        }

        const validation = await validateMappingAgainstSchema(env, p);
        if (!validation.valid) {
            // Suggestion logic
            let suggestion = '';
            const matches = allNames.filter(n => n.includes(p) || p.includes(n));
            if (matches.length > 0) {
                suggestion = `Did you mean: {{${matches[0]}}}?`;
            }

            results.push({
                placeholder: p,
                valid: false,
                error: validation.error,
                suggestion
            });
        } else {
            results.push({ placeholder: p, valid: true });
        }
    }
    return results;
};

export const replacePlaceholders = async (docxBuffer: ArrayBuffer, dataContext: any): Promise<ArrayBuffer> => {
    // Pizzip needs binary string or array buffer
    const zip = new PizZip(docxBuffer);

    // Provide a simple parser that returns empty string if value is undefined
    const expressionParser = (tag: string) => {
        return {
            get: (scope: any) => {
                const val = scope[tag];
                return val === undefined || val === null ? "" : val;
            }
        };
    };

    let doc;
    try {
        doc = new Docxtemplater(zip, {
            delimiters: { start: '{{', end: '}}' },
            paragraphLoop: true,
            linebreaks: true,
            parser: expressionParser,
            nullGetter(part: any) {
                return "";
            }
        });

        // We render the document with our flattened data object
        doc.render(dataContext);
    } catch (error: any) {
        if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors.map((e: any) => e.properties.explanation || e.properties.id || e.message).join("\n");
            throw new Error(`DOCX Templating Error:\n${errorMessages}`);
        }
        throw error;
    }

    // Get the zip document and generate it as a nodebuffer/arraybuffer
    const out = doc.getZip().generate({
        type: 'arraybuffer',
        compression: 'DEFLATE',
    });

    return out;
};

export const generateItemsTable = () => {
    // Dynamic table generation to be implemented
    throw new Error('Not implemented');
};
