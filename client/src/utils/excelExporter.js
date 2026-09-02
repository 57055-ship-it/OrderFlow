import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportOrdersToExcel = (orders = [], filenamePrefix = 'Orders') => {
  const data = orders.map((ord) => ({
    'Order #': ord.orderNumber,
    'Customer Name': ord.customer?.name || 'N/A',
    Company: ord.customer?.companyName || 'N/A',
    Date: ord.date ? format(new Date(ord.date), 'yyyy-MM-dd') : 'N/A',
    'PO Number': ord.poNumber || '',
    'Indent Number': ord.indentNumber || '',
    'Products Count': ord.products?.length || 0,
    Status: ord.status,
    'Created By': ord.createdBy?.name || 'N/A',
    'Created At': ord.createdAt ? format(new Date(ord.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const fileName = `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportCustomersToExcel = (customers = []) => {
  const data = customers.map((c) => ({
    'Customer Name': c.name,
    Company: c.companyName || '',
    'Contact Person': c.contactPerson || '',
    Phone: c.phone || '',
    Email: c.email || '',
    Address: c.address || '',
    Notes: c.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  XLSX.writeFile(workbook, `Customers_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportProductsToExcel = (products = []) => {
  const data = products.map((p) => ({
    'Product Name': p.name,
    SKU: p.sku || '',
    Category: p.category || '',
    'Default UOM': p.defaultUOM,
    Description: p.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, `Products_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
