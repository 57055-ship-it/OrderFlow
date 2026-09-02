import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateOrderPDF = (order, settings = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const companyName = settings.companyName || 'OrderFlow Enterprise';
  const address = settings.address || '750 Industrial Parkway, Tech Center, NY 10001';
  const phone = settings.phone || '+1 (800) 555-0199';
  const email = settings.email || 'billing@orderflow.com';

  // 1. Header & Company Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(companyName, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(address, 14, 26);
  doc.text(`Phone: ${phone} | Email: ${email}`, 14, 31);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 36, 196, 36);

  // 2. Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('PURCHASE / ORDER DOCUMENT', 14, 46);

  // 3. Order Information Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 52, 182, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 52, 182, 34, 'S');

  doc.setFontSize(9);
  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer?.name || 'N/A', 40, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Company:', 18, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer?.companyName || 'N/A', 40, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 18, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(order.date ? format(new Date(order.date), 'dd MMM yyyy') : 'N/A', 40, 74);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Order #:', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(order.orderNumber || 'N/A', 135, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('PO Number:', 110, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(order.poNumber || 'N/A', 135, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Indent Number:', 110, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(order.indentNumber || 'N/A', 135, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 110, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(order.status || 'Draft', 135, 81);

  // 4. Products Table (AutoTable)
  const tableHead = [['#', 'Product Description', 'Quantity', 'UOM']];
  const tableBody = (order.products || []).map((item, index) => [
    index + 1,
    item.description || 'N/A',
    item.quantity ? item.quantity.toLocaleString() : '0',
    item.uom || 'PCS'
  ]);

  doc.autoTable({
    startY: 92,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 110 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // Calculate position after table
  const finalY = doc.lastAutoTable.finalY + 25;
  const pageHeight = doc.internal.pageSize.height;

  // Add Signatures Section
  let sigY = finalY;
  if (sigY + 30 > pageHeight) {
    doc.addPage();
    sigY = 40;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Prepared By
  doc.text('Prepared By: __________________', 14, sigY);
  // Approved By
  doc.text('Approved By: __________________', 80, sigY);
  // Customer Signature
  doc.text('Customer Signature: __________________', 140, sigY);

  // Footer page number on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `OrderFlow System Document — Page ${i} of ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  doc.save(`${order.orderNumber || 'Order'}_Document.pdf`);
};
