import { BaseTemplate, type TemplateConfig } from './baseTemplate';

interface Props {
    settings: any;
    documentData: any;
    customer: any;
    items: any[];
    templateConfig: TemplateConfig;
}

export const DeliveryOrderTemplate = ({ settings, documentData, customer, items, templateConfig }: Props) => {
    const columns = [
        { label: 'Description', key: 'description', width: '80%' },
        { label: 'Qty', key: 'quantity', width: '20%', align: 'center' }
    ];

    return (
        <BaseTemplate
            type="Delivery Order"
            settings={settings}
            documentData={documentData}
            customer={customer}
            items={items}
            templateConfig={templateConfig}
            columns={columns}
            hidePricing={true}
        />
    );
};
