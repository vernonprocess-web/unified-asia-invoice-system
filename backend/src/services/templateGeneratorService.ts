import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';

export const generateBaseTemplateContent = async (type: string): Promise<ArrayBuffer> => {
    const docTitle = type === 'quotation' ? 'QUOTATION' : type === 'invoice' ? 'TAX INVOICE' : 'DELIVERY ORDER';

    const noBorder = { style: BorderStyle.NONE, size: 0, color: "auto" };

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: docTitle, bold: true, size: 48 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "{{company_name}}", bold: true, size: 28 })] }),
                new Paragraph({ text: "{{company_address}}" }),
                new Paragraph({ text: "UEN: {{company_uen}}" }),
                new Paragraph({ text: "Email: {{company_email}}" }),
                new Paragraph({ text: "" }),

                // Customer & Document Info Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
                        insideVertical: noBorder, insideHorizontal: noBorder,
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: "Bill To:", bold: true })] }),
                                        new Paragraph({ children: [new TextRun({ text: "{{customer_company}}", bold: true })] }),
                                        new Paragraph({ text: "Attn: {{customer_name}}" }),
                                        new Paragraph({ text: "{{customer_address}}" }),
                                        new Paragraph({ text: "{{customer_email}}" }),
                                    ]
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                    children: [
                                        new Paragraph({ text: `Document No: {{document_number}}`, alignment: AlignmentType.RIGHT }),
                                        new Paragraph({ text: `Date: {{document_date}}`, alignment: AlignmentType.RIGHT }),
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),

                // Items Table with proper loop
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true })], alignment: AlignmentType.CENTER })] }),
                                ...(type === 'delivery_order' ? [] : [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Unit Price", bold: true })], alignment: AlignmentType.RIGHT })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true })], alignment: AlignmentType.RIGHT })] })
                                ])
                            ]
                        }),
                        // Loop Start
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "{{#items_table}}{{description}}" })] }),
                                new TableCell({ children: [new Paragraph({ text: type === 'delivery_order' ? "{{quantity}}{{/items_table}}" : "{{quantity}}", alignment: AlignmentType.CENTER })] }),
                                ...(type === 'delivery_order' ? [] : [
                                    new TableCell({ children: [new Paragraph({ text: "{{unit_price}}", alignment: AlignmentType.RIGHT })] }),
                                    new TableCell({ children: [new Paragraph({ text: "{{amount}}{{/items_table}}", alignment: AlignmentType.RIGHT })] })
                                ])
                            ]
                        }),
                    ]
                }),

                new Paragraph({ text: "" }),

                // Totals
                ...(type === 'delivery_order' ? [] : [
                    new Paragraph({ text: `Subtotal: {{subtotal}}`, alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: `Total: {{total}}`, bold: true })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ text: `Amount in words: {{total_in_words}}` }),
                ]),

                new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),

                // Footer
                new Paragraph({ text: "{{signature}}" }),
                new Paragraph({ text: "___________________________" }),
            ],
        }],
    });

    return await Packer.toArrayBuffer(doc);
};
