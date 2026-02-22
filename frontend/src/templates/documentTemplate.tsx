import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Inter font (Using standard Helvetica for reliability as requested: Inter OR Helvetica OR Arial)
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
    },
    logo: {
        width: 80,
        height: 80,
        objectFit: 'contain',
        marginRight: 15,
    },
    companyDetails: {
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'right',
        marginBottom: 10,
    },
    documentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    metaLeft: {
        width: '50%',
    },
    metaRight: {
        width: '40%',
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        width: '40%',
        fontFamily: 'Helvetica-Bold',
    },
    metaValue: {
        width: '60%',
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 10,
        marginTop: 20,
    },
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
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    tableColDesc: { width: '40%' },
    tableColQty: { width: '15%', textAlign: 'center' },
    tableColPrice: { width: '20%', textAlign: 'right' },
    tableColAmt: { width: '25%', textAlign: 'right' },
    totalsArea: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderTopWidth: 1,
        borderTopColor: '#000',
        marginTop: 4,
        paddingTop: 4,
    },
    totalLabel: {
        fontFamily: 'Helvetica-Bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 10,
    },
    bankDetails: {
        marginBottom: 30,
    },
    signatureArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
        textAlign: 'center',
    }
});

interface DocumentTemplateProps {
    type: 'Quotation' | 'Tax Invoice' | 'Delivery Order' | 'Statement of Account';
    settings: any;
    documentData: any;
    customer: any;
    items: any[];
}

export const DocumentTemplate = ({ type, settings, documentData, customer, items }: DocumentTemplateProps) => {
    const isStatement = type === 'Statement of Account';
    const isDO = type === 'Delivery Order';

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {settings?.logo_url && (
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
                        <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>To:</Text>
                        <Text>{customer?.company_name || customer?.customer_name}</Text>
                        <Text>{customer?.billing_address}</Text>
                        <Text>Attn: {customer?.contact_person}</Text>
                    </View>

                    <View style={styles.metaRight}>
                        {!isStatement && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>{type} No:</Text>
                                <Text style={styles.metaValue}>{documentData.quotation_number || documentData.invoice_number || documentData.do_number}</Text>
                            </View>
                        )}
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Date:</Text>
                            <Text style={styles.metaValue}>{documentData.issue_date || documentData.delivery_date || documentData.date_from}</Text>
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
                        <Text style={[styles.tableHeaderItem, isStatement ? { width: '20%' } : styles.tableColDesc]}>
                            {isStatement ? 'Date' : 'Description'}
                        </Text>
                        <Text style={[styles.tableHeaderItem, isStatement ? { width: '40%' } : styles.tableColQty]}>
                            {isStatement ? 'Document' : 'Qty'}
                        </Text>
                        {!isDO && !isStatement && (
                            <Text style={[styles.tableHeaderItem, styles.tableColPrice]}>Unit Price</Text>
                        )}
                        {!isDO && (
                            <Text style={[styles.tableHeaderItem, isStatement ? { width: '40%', textAlign: 'right' } : styles.tableColAmt]}>Amount</Text>
                        )}
                    </View>

                    {items && items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={isStatement ? { width: '20%' } : styles.tableColDesc}>{isStatement ? item.issue_date : item.description}</Text>
                            <Text style={isStatement ? { width: '40%' } : styles.tableColQty}>{isStatement ? item.invoice_number : item.quantity}</Text>
                            {!isDO && !isStatement && (
                                <Text style={styles.tableColPrice}>${parseFloat(item.unit_price).toFixed(2)}</Text>
                            )}
                            {!isDO && (
                                <Text style={isStatement ? { width: '40%', textAlign: 'right' } : styles.tableColAmt}>${parseFloat(isStatement ? item.total : item.amount).toFixed(2)}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* TOTALS */}
                {!isDO && (
                    <View style={styles.totalsArea}>
                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                                    ${isStatement ? documentData.totalInvoiced?.toFixed(2) : documentData.total?.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* FOOTER */}
                <View style={styles.footer}>
                    {!isDO && settings?.bank_name && (
                        <View style={styles.bankDetails}>
                            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Payment Details:</Text>
                            <Text>Bank: {settings.bank_name}</Text>
                            <Text>Account Name: {settings.account_name}</Text>
                            <Text>Account No: {settings.account_number}</Text>
                        </View>
                    )}

                    <View style={styles.signatureArea}>
                        <View style={styles.signatureBox}>
                            <Text>Authorised Signature / Company Stamp</Text>
                        </View>
                        {(isDO || type === 'Quotation') && (
                            <View style={styles.signatureBox}>
                                <Text>Accepted By / Date</Text>
                            </View>
                        )}
                    </View>
                </View>

            </Page>
        </Document>
    );
};
