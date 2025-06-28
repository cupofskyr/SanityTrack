
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PhotoUploader from './photo-uploader';
import { useToast } from '@/hooks/use-toast';

type WizardStep = 'basics' | 'justification' | 'receipts' | 'review';

type FormData = {
    vendor: string;
    amount: string;
    transactionDate: Date | undefined;
    paymentAccount: string;
    purpose: string;
    receipt: string | null;
    suggestedCategory: string;
};

export default function FinancialWizard({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState<WizardStep>('basics');
    const { toast } = useToast();
    
    const [formData, setFormData] = useState<FormData>({
        vendor: '',
        amount: '',
        transactionDate: new Date(),
        paymentAccount: '',
        purpose: '',
        receipt: null,
        suggestedCategory: '',
    });

    const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

    // Effect to suggest category based on purpose, with debouncing
    useEffect(() => {
        if (!formData.purpose.trim()) {
          setFormData(prev => ({...prev, suggestedCategory: ''}));
          return;
        }

        setIsSuggestingCategory(true);
        const handler = setTimeout(async () => {
          // Placeholder for AI Cloud Function call
          // In a real app, you would make a call like this:
          // const result = await getCategorySuggestion({ purpose: formData.purpose });
          // if (result.success) {
          //   setFormData(prev => ({ ...prev, suggestedCategory: result.category }));
          // }
          // For this demo, we'll simulate a successful AI suggestion after a delay.
          
          let suggestion = 'General Supplies';
          if (formData.purpose.toLowerCase().includes('lunch') || formData.purpose.toLowerCase().includes('dinner')) {
              suggestion = 'Meals & Entertainment';
          } else if (formData.purpose.toLowerCase().includes('uber') || formData.purpose.toLowerCase().includes('flight')) {
              suggestion = 'Travel';
          }
          
          setFormData(prev => ({ ...prev, suggestedCategory: suggestion }));
          setIsSuggestingCategory(false);
          toast({ title: 'AI Suggestion', description: `Category suggested: ${suggestion}`});

        }, 800); // 800ms debounce delay
    
        return () => {
          clearTimeout(handler);
          setIsSuggestingCategory(false);
        };
      }, [formData.purpose, toast]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        // Placeholder for saving the formData to your Firestore 'expenses' collection
        console.log("Submitting expense to Firebase:", formData);
        toast({ title: "Expense Submitted (Simulated)", description: "Your expense has been sent for approval." });

        onClose();
    };

    const nextStep = () => {
        switch (step) {
            case 'basics': setStep('justification'); break;
            case 'justification': setStep('receipts'); break;
            case 'receipts': setStep('review'); break;
            case 'review': 
                handleSubmit();
                break;
        }
    };
    
    const prevStep = () => {
        switch (step) {
            case 'justification': setStep('basics'); break;
            case 'receipts': setStep('justification'); break;
            case 'review': setStep('receipts'); break;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'basics':
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 1: Transaction Basics</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="vendor">Vendor</Label>
                                <Select value={formData.vendor} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor: value }))}>
                                    <SelectTrigger id="vendor"><SelectValue placeholder="Select a vendor..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sysco">Sysco</SelectItem>
                                        <SelectItem value="costco">Costco</SelectItem>
                                        <SelectItem value="uber">Uber</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-1.5">
                                <Label htmlFor="amount">Total Amount</Label>
                                <Input id="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleInputChange}/>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Transaction Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn(!formData.transactionDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.transactionDate ? format(formData.transactionDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.transactionDate} onSelect={(date) => setFormData(prev => ({ ...prev, transactionDate: date }))} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                             <div className="grid gap-1.5">
                                <Label htmlFor="paymentAccount">Payment Account</Label>
                                <Select value={formData.paymentAccount} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentAccount: value }))}>
                                    <SelectTrigger id="paymentAccount"><SelectValue placeholder="Select account..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chase-sapphire">Chase Sapphire (**** 1234)</SelectItem>
                                        <SelectItem value="amex-gold">Amex Gold (**** 5678)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 'justification':
                return (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 2: Justification & Categorization</h3>
                        <div className="grid gap-1.5">
                            <Label htmlFor="purpose">Purpose of Expense</Label>
                            <Textarea id="purpose" placeholder="e.g., 'Team lunch to celebrate Q3 results.'" rows={4} value={formData.purpose} onChange={handleInputChange}/>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="suggestedCategory">AI Suggested Category</Label>
                            <div className="flex items-center gap-2">
                                <Input id="suggestedCategory" readOnly value={formData.suggestedCategory} className="bg-muted" placeholder="AI will suggest a category..."/>
                                {isSuggestingCategory && <Loader2 className="h-5 w-5 animate-spin" />}
                                {!isSuggestingCategory && formData.suggestedCategory && <Sparkles className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground">The AI suggests a category based on your description. You can override it on the review step.</p>
                        </div>
                    </div>
                );
            case 'receipts':
                 return (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 3: Attach Receipts</h3>
                        <PhotoUploader onPhotoDataChange={(dataUrl) => setFormData(prev => ({ ...prev, receipt: dataUrl }))}/>
                    </div>
                );
            case 'review':
                return (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 4: Review & Submit</h3>
                        <p className="text-sm text-muted-foreground">Please review all details before submitting. This will create a purchase record in QuickBooks.</p>
                         <div className="space-y-2 p-4 border rounded-md bg-muted/50 text-sm">
                            <p><strong>Vendor:</strong> {formData.vendor || 'N/A'}</p>
                            <p><strong>Amount:</strong> ${formData.amount || '0.00'}</p>
                            <p><strong>Date:</strong> {formData.transactionDate ? format(formData.transactionDate, "PPP") : 'N/A'}</p>
                            <p><strong>Category:</strong> {formData.suggestedCategory || 'N/A'}</p>
                            <p><strong>Purpose:</strong> {formData.purpose || 'N/A'}</p>
                            <p><strong>Receipts:</strong> {formData.receipt ? '1 file attached' : 'None'}</p>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="py-4 space-y-6">
            {renderStep()}
            <div className="flex justify-between items-center pt-4 border-t">
                {step !== 'basics' ? (
                    <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                ) : <div />}
                
                <Button onClick={nextStep}>
                    {step === 'review' ? 'Submit Expense' : 'Next'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

