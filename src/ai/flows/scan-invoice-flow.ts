
'use server';

/**
 * @fileOverview An AI flow for scanning and parsing a vendor invoice image.
 *
 * - scanInvoice - A function that extracts line items from an invoice photo.
 * - ScanInvoiceInput - The input type for the function.
 * - ScanInvoiceOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import {
    ScanInvoiceInputSchema,
    type ScanInvoiceInput,
    ScanInvoiceOutputSchema,
    type ScanInvoiceOutput
} from '@/ai/schemas/invoice-scan-schemas';


export async function scanInvoice(input: ScanInvoiceInput): Promise<ScanInvoiceOutput> {
  return scanInvoiceFlow(input);
}

const prompt = ai.definePrompt({
    name: 'scanInvoicePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: ScanInvoiceInputSchema },
    output: { schema: ScanInvoiceOutputSchema },
    prompt: `You are an expert inventory management assistant with advanced OCR capabilities. 
    Your task is to accurately scan the provided image of a delivery invoice and extract all inventory line items and their corresponding quantities.

    Here is a list of known inventory items in our system. Match the items from the invoice to this list as closely as possible.
    Known Items: {{#each knownItems}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

    Follow these rules strictly:
    1.  Only extract lines that represent tangible products.
    2.  Ignore any lines related to tax, delivery fees, totals, subtotals, or any other non-product charges.
    3.  If an item on the invoice has a quantity, extract it. If it doesn't, assume the quantity is 1.
    4.  Return the data in the specified JSON format.

    Invoice to analyze:
    {{media url=invoiceImageUri}}
`,
});

const scanInvoiceFlow = ai.defineFlow(
  {
    name: 'scanInvoiceFlow',
    inputSchema: ScanInvoiceInputSchema,
    outputSchema: ScanInvoiceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again or enter items manually.');
    }
    return output;
  }
);
