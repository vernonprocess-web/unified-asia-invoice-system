import { Bindings } from '../types';

export const convertDocxToPdf = async (
    env: Bindings,
    docxBuffer: ArrayBuffer,
    fileName: string = 'document.docx'
): Promise<ArrayBuffer> => {
    // We expect the CONVERTAPI_SECRET to be configured in Wrangler secrets
    const secret = env.CONVERTAPI_SECRET;

    if (!secret) {
        throw new Error('CONVERTAPI_SECRET is not configured. PDF conversion unavailable.');
    }

    try {
        const formData = new FormData();
        const blob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        formData.append('File', blob, fileName);
        formData.append('StoreFile', 'true'); // ConvertAPI requires this for immediate response streaming in some forms, though direct conversion usually works

        const response = await fetch(`https://v2.convertapi.com/convert/docx/to/pdf?Secret=${secret}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorResult = await response.json();
            console.error('ConvertAPI Error:', errorResult);
            throw new Error(`Failed to convert DOCX to PDF: ${response.statusText}`);
        }

        const result: any = await response.json();

        // ConvertAPI returns the file data as Base64 in the JSON response when StoreFile=true.
        if (result.Files && result.Files.length > 0) {
            const fileData = result.Files[0].FileData;

            // Convert Base64 back to ArrayBuffer
            const binaryString = atob(fileData);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        throw new Error("Invalid response format from ConvertAPI");

    } catch (e: any) {
        console.error('PDF Conversion Error:', e);
        throw new Error(`PDF Conversion failed: ${e.message}`);
    }
};
