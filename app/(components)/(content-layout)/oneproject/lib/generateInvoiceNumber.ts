export function generateInvoiceNumber(): string {
  // Generate a random number between 1000000 and 9999999 (7 digits)
  const invoiceNumber = Math.floor(1000000 + Math.random() * 9000000);
  return invoiceNumber.toString();
}
