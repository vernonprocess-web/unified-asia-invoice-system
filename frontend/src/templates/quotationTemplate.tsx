import { BaseTemplate, type TemplateConfig } from './baseTemplate';

interface Props {
    settings: any;
    documentData: any;
    customer: any;
    items: any[];
    templateConfig: TemplateConfig;
}

export const QuotationTemplate = ({ settings, documentData, customer, items, templateConfig }: Props) => {
    const columns = [
        { label: 'Description', key: 'description', width: '40%' },
        { label: 'Qty', key: 'quantity', width: '15%', align: 'center' },
        { label: 'Unit Price', key: 'unit_price', width: '20%', align: 'right' },
        { label: 'Amount', key: 'amount', width: '25%', align: 'right' }
    ];

    return (
        <BaseTemplate
            type="Quotation"
            settings={settings}
            documentData={documentData}
            customer={customer}
            items={items}
            templateConfig={templateConfig}
            columns={columns}
            totalLabel="Total Amount"
            totalValue={documentData.total}
        />
    );
};
