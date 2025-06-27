
import { z } from 'zod';

export const ScanInvoiceInputSchema = z.object({
  invoiceImageUri: z.string().describe("The delivery invoice image as a data URI."),
  knownItems: z.array(z.string()).describe("A list of known inventory item names in the system to help with matching."),
});
export type ScanInvoiceInput = z.infer<typeof ScanInvoiceInputSchema>;

export const ScannedItemSchema = z.object({
  itemName: z.string().describe("The name of the item identified on the invoice."),
  quantity: z.number().describe("The quantity of the item received."),
});

export const ScanInvoiceOutputSchema = z.object({
  scannedItems: z.array(ScannedItemSchema).describe("A list of all inventory items and quantities extracted from the invoice."),
});
export type ScanInvoiceOutput = z.infer<typeof ScanInvoiceOutputSchema>;
