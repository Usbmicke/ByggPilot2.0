'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@/app/types';

// TODO: Hämta från inställningar
const companyInfo = { name: 'Byggbolaget AB', address: 'Industrigatan 5', zip: '123 45', city: 'STORSTAD', phone: '08-123 456 78', email: 'kontakt@byggbolaget.se', orgnr: '556677-8899', bankgiro: '123-4567' };

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, backgroundColor: '#ffffff', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  companyInfo: { textAlign: 'right' },
  companyName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  invoiceInfo: { textAlign: 'right', fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  customerInfo: { marginBottom: 30 },
  table: { display: "flex", width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e0e0e0', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: 'row', borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', alignItems: 'center', backgroundColor: '#f9f9f9' },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderColor: '#e0e0e0', borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableColHeader: { padding: 8 },
  description: { width: '40%' },
  quantity: { width: '10%', textAlign: 'right' },
  unitPrice: { width: '15%', textAlign: 'right' },
  vat: { width: '10%', textAlign: 'right' },
  total: { width: '25%', textAlign: 'right' },
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  totalsTable: { width: '50%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  totalLabel: {}, 
  totalValue: { fontWeight: 'bold' },
  grandTotalRow: { marginTop: 5, borderTopWidth: 2, borderColor: '#333' },
  grandTotalLabel: { fontSize: 14 },
  grandTotalValue: { fontSize: 14, fontWeight: 'bold' },
  rotSection: { marginTop: 15, padding: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  rotText: { fontStyle: 'italic', color: '#555' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 9, color: '#666' }
});

export const InvoicePdfTemplate = ({ invoice }: { invoice: Invoice }) => {
  const subTotal = invoice.invoiceLines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);
  const totalVat = invoice.invoiceLines.reduce((acc, line) => acc + (line.unitPrice * line.quantity * (line.vatRate / 100)), 0);
  const grandTotal = subTotal + totalVat;

  let rotDeductionAmount = 0;
  let amountToPay = grandTotal;
  if (invoice.rotDeduction) {
    // ROT-avdrag är 30% av arbetskostnaden, men aldrig mer än 50 000 kr. 
    // TODO: Hämta maxbelopp (50000) från globala inställningar.
    const maxDeduction = 50000;
    const calculatedDeduction = invoice.rotDeduction.laborCost * 0.3;
    rotDeductionAmount = Math.min(calculatedDeduction, maxDeduction);
    amountToPay = grandTotal - rotDeductionAmount;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ... Header & Kundinfo ... */}
        <View style={styles.header}>
          <View><Text style={styles.companyName}>{companyInfo.name}</Text></View>
          <View style={styles.companyInfo}>
            <Text>{companyInfo.address}, {companyInfo.zip} {companyInfo.city}</Text>
            <Text>{companyInfo.phone} | {companyInfo.email}</Text>
          </View>
        </View>
        <Text style={styles.invoiceInfo}>FAKTURA #{invoice.id.substring(0,8)}</Text>
        <View style={styles.customerInfo}>
            <Text>KUND:</Text>
            <Text style={{ fontWeight: 'bold' }}>{invoice.customer.name}</Text>
            {/* TODO: Kundadress */}
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <View style={{ width: '50%' }}><Text>Fakturadatum: {new Date(invoice.issueDate).toLocaleDateString('sv-SE')}</Text></View>
            <View style={{ width: '50%' }}><Text>Förfallodatum: {new Date(invoice.dueDate).toLocaleDateString('sv-SE')}</Text></View>
        </View>

        {/* Fakturarader */}
        <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCol, styles.tableColHeader, styles.description]}>Beskrivning</Text>
                <Text style={[styles.tableCol, styles.tableColHeader, styles.quantity]}>Antal</Text>
                <Text style={[styles.tableCol, styles.tableColHeader, styles.unitPrice]}>Á-pris</Text>
                <Text style={[styles.tableCol, styles.tableColHeader, styles.vat]}>Moms</Text>
                <Text style={[styles.tableCol, styles.tableColHeader, styles.total]}>Summa</Text>
            </View>
            {invoice.invoiceLines.map((line, i) => (
                <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCol, styles.description]}>{line.description}</Text>
                    <Text style={[styles.tableCol, styles.quantity]}>{line.quantity} {line.unit}</Text>
                    <Text style={[styles.tableCol, styles.unitPrice]}>{line.unitPrice.toFixed(2)}</Text>
                    <Text style={[styles.tableCol, styles.vat]}>{line.vatRate}%</Text>
                    <Text style={[styles.tableCol, styles.total]}>{(line.quantity * line.unitPrice).toFixed(2)}</Text>
                </View>
            ))}
        </View>

        {/* Totalsummor */}
        <View style={styles.totalsSection}>
            <View style={styles.totalsTable}>
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Nettobelopp:</Text><Text style={styles.totalValue}>{subTotal.toFixed(2)} SEK</Text></View>
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Moms:</Text><Text style={styles.totalValue}>{totalVat.toFixed(2)} SEK</Text></View>
                <View style={[styles.totalRow]}><Text style={styles.totalLabel}>Totalsumma:</Text><Text style={styles.totalValue}>{grandTotal.toFixed(2)} SEK</Text></View>
                
                {invoice.rotDeduction && (
                  <>
                    <View style={[styles.totalRow, styles.rotSection]}>
                        <Text style={styles.totalLabel}>Beviljat ROT-avdrag:</Text>
                        <Text style={styles.totalValue}>-{rotDeductionAmount.toFixed(2)} SEK</Text>
                    </View>
                     <Text style={styles.rotText}>ROT-avdraget baseras på en arbetskostnad om {invoice.rotDeduction.laborCost.toFixed(2)} SEK.</Text>
                  </>
                )}

                <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Att betala:</Text>
                    <Text style={[styles.grandTotalValue]}>{amountToPay.toFixed(2)} SEK</Text>
                </View>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <Text>{companyInfo.name} | Org.nr: {companyInfo.orgnr} | Bankgiro: {companyInfo.bankgiro}</Text>
            <Text>Innehar F-skattsedel</Text>
        </View>
      </Page>
    </Document>
  );
};