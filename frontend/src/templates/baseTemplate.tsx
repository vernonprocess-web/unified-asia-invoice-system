import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

export interface TemplateConfig {
    font_family: string;
    header_font_size: number;
    body_font_size: number;
    table_font_size: number;
    footer_font_size: number;
    logo_position: 'left' | 'center' | 'right';
    logo_size: number;
    show_logo: boolean;
    show_signature: boolean;
    show_bank_details: boolean;
    margin_top: number;
    margin_bottom: number;
    margin_left: number;
    margin_right: number;
    layout_config: any;
}

export interface BaseTemplateProps {
    type: string;
    settings: any; // Company settings
    documentData: any;
    customer: any;
    items: any[];
    templateConfig: TemplateConfig;
    columns: { label: string; key: string; width: string; align?: string }[];
    totalLabel?: string;
    totalValue?: number;
    hidePricing?: boolean;
}

export const BaseTemplate = ({
    type,
    settings,
    documentData,
    customer,
    items,
    templateConfig,
    columns,
    totalLabel,
    totalValue,
    hidePricing = false
}: BaseTemplateProps) => {

    const layout = typeof templateConfig.layout_config === 'string'
        ? JSON.parse(templateConfig.layout_config || '{}')
        : (templateConfig.layout_config || {});

    // Force string boolean representations from sqlite to actual booleans (SQLite stores 1/0)
    const showLogo = templateConfig.show_logo === true || (templateConfig.show_logo as any) === 1;
    const showSignature = templateConfig.show_signature === true || (templateConfig.show_signature as any) === 1;
    const showBank = templateConfig.show_bank_details === true || (templateConfig.show_bank_details as any) === 1;

    // Use Helvetica if Inter isn't provided/registered
    const fontFamily = templateConfig.font_family || 'Helvetica';
    const fontBold = `${fontFamily}-Bold`;

    const styles = StyleSheet.create({
        page: {
            paddingTop: templateConfig.margin_top || 40,
            paddingBottom: templateConfig.margin_bottom || 40,
            paddingLeft: templateConfig.margin_left || 40,
            paddingRight: templateConfig.margin_right || 40,
            fontFamily: fontFamily,
            fontSize: templateConfig.body_font_size || 10,
            color: '#000',
        },
        header: {
            flexDirection: templateConfig.logo_position === 'right' ? 'row-reverse' : (templateConfig.logo_position === 'center' ? 'column' : 'row'),
            justifyContent: 'space-between',
            alignItems: templateConfig.logo_position === 'center' ? 'center' : 'flex-start',
            marginBottom: 40,
            borderBottomWidth: 1,
            borderBottomColor: '#000',
            paddingBottom: 20,
        },
        headerLeft: {
            flexDirection: templateConfig.logo_position === 'center' ? 'column' : 'row',
            alignItems: templateConfig.logo_position === 'center' ? 'center' : 'flex-start',
        },
        logo: {
            width: templateConfig.logo_size || 100,
            height: templateConfig.logo_size || 100,
            objectFit: 'contain',
            marginRight: templateConfig.logo_position === 'left' ? 15 : 0,
            marginLeft: templateConfig.logo_position === 'right' ? 15 : 0,
            marginBottom: templateConfig.logo_position === 'center' ? 15 : 0,
        },
        companyDetails: {
            justifyContent: 'center',
            alignItems: templateConfig.logo_position === 'center' ? 'center' : 'flex-start',
        },
        companyName: {
            fontSize: templateConfig.header_font_size || 16,
            fontFamily: fontBold,
            marginBottom: 4,
        },
        title: {
            fontSize: (templateConfig.header_font_size || 16) - 2,
            fontFamily: fontBold,
            textTransform: 'uppercase',
            textAlign: 'right',
            marginBottom: 10,
        },
        documentMeta: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 30,
        },
        metaLeft: { width: '50%' },
        metaRight: { width: '40%' },
        metaRow: { flexDirection: 'row', marginBottom: 4 },
        metaLabel: { width: '40%', fontFamily: fontBold },
        metaValue: { width: '60%' },
        table: {
            width: '100%',
            marginTop: 10,
        },
        tableHeader: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#000',
            paddingBottom: 5,
            marginBottom: 5,
        },
        tableHeaderItem: {
            fontFamily: fontBold,
            fontSize: templateConfig.table_font_size || 9,
        },
        tableRow: {
            flexDirection: 'row',
            paddingVertical: 4,
            fontSize: templateConfig.table_font_size || 9,
        },
        totalsArea: {
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        totalsBox: { width: '40%' },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 4,
            borderTopWidth: 1,
            borderTopColor: '#000',
            marginTop: 4,
            paddingTop: 4,
            fontSize: templateConfig.table_font_size || 9,
        },
        totalLabel: { fontFamily: fontBold },
        footer: {
            position: 'absolute',
            bottom: 30,
            left: templateConfig.margin_left || 40,
            right: templateConfig.margin_right || 40,
            fontSize: templateConfig.footer_font_size || 9,
        },
        bankDetails: { marginBottom: 30 },
        signatureArea: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 40
        },
        signatureBox: {
            width: '40%',
            borderTopWidth: 1,
            borderTopColor: '#000',
            paddingTop: 5,
            textAlign: 'center',
        }
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {showLogo && settings?.logo_url && (
                            <Image source={{ uri: `http://localhost:8787${settings.logo_url}` }} style={styles.logo} />
                        )}
                        <View style={styles.companyDetails}>
                            <Text style={styles.companyName}>{settings?.company_name || 'UNIFIED ASIA SOLUTIONS PTE LTD'}</Text>
                            <Text>UEN: {settings?.UEN || '202534648M'}</Text>
                            <Text>{settings?.address || '60 PAYA LEBAR ROAD, #06-28, PAYA LEBAR SQUARE, SINGAPORE 409051'}</Text>
                            <Text>Email: {settings?.email || 'joe@unified-as.com'}</Text>
                        </View>
                    </View>
                </View>

                {/* DOCUMENT META */}
                <Text style={styles.title}>{type}</Text>
                <View style={styles.documentMeta}>
                    <View style={styles.metaLeft}>
                        <Text style={{ fontFamily: fontBold, marginBottom: 5 }}>To:</Text>
                        <Text>{customer?.company_name || customer?.customer_name}</Text>
                        <Text>{customer?.billing_address}</Text>
                        <Text>Attn: {customer?.contact_person}</Text>
                    </View>
                    <View style={styles.metaRight}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>{type} No:</Text>
                            <Text style={styles.metaValue}>{documentData.quotation_number || documentData.invoice_number || documentData.do_number}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Date:</Text>
                            <Text style={styles.metaValue}>{documentData.issue_date || documentData.delivery_date}</Text>
                        </View>
                        {documentData.due_date && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Due Date:</Text>
                                <Text style={styles.metaValue}>{documentData.due_date}</Text>
                            </View>
                        )}
                        {documentData.payment_terms && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Terms:</Text>
                                <Text style={styles.metaValue}>{documentData.payment_terms}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ITEMS TABLE */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        {columns.map((col, idx) => (
                            <Text key={idx} style={[styles.tableHeaderItem, { width: col.width, textAlign: (col.align as any) || 'left' }]}>
                                {col.label}
                            </Text>
                        ))}
                    </View>
                    {items && items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            {columns.map((col, idx) => {
                                let val = item[col.key];
                                if (['unit_price', 'amount', 'total'].includes(col.key)) {
                                    val = `$${parseFloat(val || 0).toFixed(2)}`;
                                }
                                return (
                                    <Text key={idx} style={{ width: col.width, textAlign: (col.align as any) || 'left' }}>
                                        {val}
                                    </Text>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* TOTALS */}
                {!hidePricing && totalValue !== undefined && (
                    <View style={styles.totalsArea}>
                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>{totalLabel || 'Total'}</Text>
                                <Text style={{ fontFamily: fontBold }}>${totalValue.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* FOOTER */}
                <View style={styles.footer}>
                    {showBank && settings?.bank_name && (layout.bankDetails !== false) && (
                        <View style={styles.bankDetails}>
                            <Text style={{ fontFamily: fontBold, marginBottom: 4 }}>Payment Details:</Text>
                            <Text>Bank: {settings.bank_name}</Text>
                            <Text>Account Name: {settings.account_name}</Text>
                            <Text>Account No: {settings.account_number}</Text>
                        </View>
                    )}

                    {showSignature && (
                        <View style={styles.signatureArea}>
                            <View style={styles.signatureBox}>
                                <Text>{layout.signatureText || 'Authorised Signature / Company Stamp'}</Text>
                            </View>
                            {layout.acceptedByText && (
                                <View style={styles.signatureBox}>
                                    <Text>{layout.acceptedByText}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};
