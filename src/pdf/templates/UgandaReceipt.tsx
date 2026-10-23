import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// ---------- Types ----------

export type ReceiptPdfItem = {
    description: string;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    lineTotal: number; // net of VAT
};

export type ReceiptPdfData = {
    receiptNumber: string;
    date: Date;
    business: {
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        tin: string | null;
    };
    buyerName: string | null;
    items: ReceiptPdfItem[];
    subtotal: number;   // net
    vat: number;        // VAT portion
    total: number;      // gross
    currency: string;
    amountInWords: string;
    duplicate?: boolean;
    logoUrl: string | null;
};

// ---------- Helpers ----------

function fmt(n: number) {
    return n.toLocaleString('en-UG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function fmtDate(d: Date) {
    return format(d, 'dd-MMM-yy');
}

// ---------- Styles ----------

// A5 in points: 419.53 x 595.28
const styles = StyleSheet.create({
    page: {
        paddingTop: 22,
        paddingBottom: 22,
        paddingHorizontal: 24,
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#111',
        lineHeight: 1.25,
    },
    // --- Top strip ---
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    topLeft: { fontSize: 8.5 },
    topRight: { fontSize: 8.5, textAlign: 'right' },
    centerTitle: {
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        marginTop: 2,
        marginBottom: 6,
        letterSpacing: 1,
    },
    duplicate: {
        textAlign: 'center',
        fontFamily: 'Helvetica-Oblique',
        fontSize: 8,
        marginTop: 2,
        color: '#444',
    },

    // --- Business block ---
    businessRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    businessLeft: { width: '60%' },
    businessName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginBottom: 1,
    },
    businessLine: { fontSize: 8, color: '#222' },
    buyerBox: {
        width: '38%',
        paddingLeft: 6,
    },
    buyerLabel: { fontSize: 7.5, color: '#555' },
    buyerName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9.5,
        marginTop: 1,
    },
    logo: { width: 60, height: 60, objectFit: 'contain', marginBottom: 2 },

    // --- Table ---
    tableHeader: {
        flexDirection: 'row',
        borderTopWidth: 0.75,
        borderBottomWidth: 0.75,
        borderColor: '#111',
        paddingVertical: 3,
        marginTop: 6,
        marginBottom: 2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        borderBottomWidth: 0.3,
        borderColor: '#ccc',
    },
    colSl: { width: '7%', fontSize: 7.5 },
    colDesc: { width: '43%' },
    colQty: { width: '12%', textAlign: 'right' },
    colRate: { width: '13%', textAlign: 'right' },
    colPer: { width: '8%', textAlign: 'center' },
    colAmount: { width: '17%', textAlign: 'right' },
    th: { fontFamily: 'Helvetica-Bold', fontSize: 7.5 },

    // --- VAT control row ---
    vatRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        marginTop: 1,
    },
    vatLabel: {
        width: '84%',
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        letterSpacing: 0.5,
    },
    vatValue: {
        width: '16%',
        textAlign: 'right',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },

    // --- Totals ---
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 0.75,
        borderBottomWidth: 0.75,
        borderColor: '#111',
        paddingVertical: 4,
        marginTop: 4,
    },
    totalLabel: {
        width: '84%',
        textAlign: 'right',
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        paddingRight: 6,
    },
    totalValue: {
        width: '16%',
        textAlign: 'right',
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },

    // --- Amount in words ---
    wordsBlock: {
        marginTop: 10,
    },
    wordsLabel: { fontSize: 7.5, color: '#555' },
    wordsValue: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        marginTop: 1,
    },

    // --- Declaration ---
    declaration: {
        marginTop: 12,
        fontSize: 7.5,
        lineHeight: 1.35,
        color: '#333',
    },
    declarationLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: '#111',
    },

    // --- Signatures ---
    signRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        alignItems: 'flex-end',
    },
    signCol: { width: '45%' },
    signLine: {
        borderTopWidth: 0.5,
        borderColor: '#111',
        paddingTop: 3,
        fontSize: 7.5,
        textAlign: 'center',
    },
    signLabel: {
        fontSize: 7.5,
        marginBottom: 26,
    },
    authorizedFor: {
        fontSize: 7.5,
        textAlign: 'right',
        marginBottom: 26,
    },

    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 14,
        left: 24,
        right: 24,
        textAlign: 'center',
        fontSize: 7,
        color: '#555',
    },
});

// ---------- Component ----------

export function UgandaReceiptPage({
    data,
}: {
    data: ReceiptPdfData;
}) {
    return (
        <Page size="A5" style={styles.page}>
            {/* Top strip */}
            <View style={styles.topRow}>
                <View style={styles.topLeft}>
                    <Text>Invoice No. {data.receiptNumber}</Text>
                    <Text>Ref. No.</Text>
                </View>
                <View style={styles.topRight}>
                    <Text>Dated {fmtDate(data.date)}</Text>
                </View>
            </View>

            {/* Title */}
            <Text style={styles.centerTitle}>INVOICE</Text>
            {data.duplicate && (
                <Text style={styles.duplicate}>(Duplicate)</Text>
            )}

            {/* Business + Buyer */}
            <View style={styles.businessRow}>
                <View style={styles.businessLeft}>
                    {data.logoUrl && (
                        <Image style={styles.logo} src={data.logoUrl} />
                    )}
                    <Text style={styles.businessName}>{data.business.name}</Text>
                    {data.business.address && (
                        <Text style={styles.businessLine}>{data.business.address}</Text>
                    )}
                    {data.business.phone && (
                        <Text style={styles.businessLine}>Tel: {data.business.phone}</Text>
                    )}
                    {data.business.email && (
                        <Text style={styles.businessLine}>{data.business.email}</Text>
                    )}
                    {data.business.tin && (
                        <Text style={styles.businessLine}>TIN: {data.business.tin}</Text>
                    )}
                </View>
                <View style={styles.buyerBox}>
                    <Text style={styles.buyerLabel}>Buyer (Bill to)</Text>
                    <Text style={styles.buyerName}>
                        {data.buyerName || 'Walk-in Customer'}
                    </Text>
                </View>
            </View>

            {/* Items table */}
            <View style={styles.tableHeader}>
                <Text style={[styles.colSl, styles.th]}>Sl No</Text>
                <Text style={[styles.colDesc, styles.th]}>Description of Goods</Text>
                <Text style={[styles.colQty, styles.th]}>Quantity</Text>
                <Text style={[styles.colRate, styles.th]}>Rate</Text>
                <Text style={[styles.colPer, styles.th]}>per</Text>
                <Text style={[styles.colAmount, styles.th]}>Amount</Text>
            </View>

            {data.items.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                    <Text style={styles.colSl}>{i + 1}.</Text>
                    <Text style={styles.colDesc}>{item.description}</Text>
                    <Text style={styles.colQty}>
                        {item.quantity.toFixed(2)} {item.unit ?? ''}
                    </Text>
                    <Text style={styles.colRate}>{fmt(item.unitPrice)}</Text>
                    <Text style={styles.colPer}>{item.unit ?? ''}</Text>
                    <Text style={styles.colAmount}>{fmt(item.lineTotal)}</Text>
                </View>
            ))}

            {/* VAT control row */}
            <View style={styles.vatRow}>
                <Text style={styles.vatLabel}>VAT CONTROL A/C</Text>
                <Text style={styles.vatValue}>{fmt(data.vat)}</Text>
            </View>

            {/* Total row */}
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                    Total  {data.items
                        .reduce((s, it) => s + it.quantity, 0)
                        .toFixed(2)}{' '}
                </Text>
                <Text style={styles.totalValue}>
                    {fmt(data.total)} {data.currency}
                </Text>
            </View>

            {/* Amount in words */}
            <View style={styles.wordsBlock}>
                <Text style={styles.wordsLabel}>Amount Chargeable (in words)</Text>
                <Text style={styles.wordsValue}>{data.amountInWords}</Text>
            </View>

            {/* Declaration */}
            <View style={styles.declaration}>
                <Text>
                    <Text style={styles.declarationLabel}>Declaration{'\n'}</Text>
                    We declare that this invoice shows the actual price of the goods
                    described and that all particulars are true and correct.
                </Text>
            </View>

            {/* Signatures */}
            <View style={styles.signRow}>
                <View style={styles.signCol}>
                    <Text style={styles.signLabel}>Customer&apos;s Seal and Signature</Text>
                    <Text style={styles.signLine}> </Text>
                </View>
                <View style={styles.signCol}>
                    <Text style={styles.authorizedFor}>
                        for {data.business.name}
                    </Text>
                    <Text style={styles.signLine}>Authorized Signatory</Text>
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer} fixed>
                This is a Computer Generated Invoice
            </Text>
        </Page>
    );
}