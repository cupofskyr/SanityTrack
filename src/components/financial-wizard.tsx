
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PhotoUploader from './photo-uploader';

type WizardStep = 'basics' | 'justification' | 'receipts' | 'review';

export default function FinancialWizard({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState<WizardStep>('basics');

    // Form state would be managed here, e.g., using useState or react-hook-form
    const [date, setDate] = useState<Date | undefined>(new Date());

    const nextStep = () => {
        switch (step) {
            case 'basics': setStep('justification'); break;
            case 'justification': setStep('receipts'); break;
            case 'receipts': setStep('review'); break;
            case 'review': 
                // Handle final submission here
                onClose();
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
                                <Select>
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
                                <Input id="amount" type="number" placeholder="0.00" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Transaction Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn(!date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                             <div className="grid gap-1.5">
                                <Label htmlFor="payment-account">Payment Account</Label>
                                <Select>
                                    <SelectTrigger id="payment-account"><SelectValue placeholder="Select account..." /></SelectTrigger>
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
                            <Textarea id="purpose" placeholder="e.g., 'Team lunch to celebrate Q3 results. Attendees: A, B, C.'" rows={4}/>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="category">AI Suggested Category</Label>
                            <Input id="category" readOnly value="Meals & Entertainment" className="bg-muted"/>
                            <p className="text-xs text-muted-foreground">The AI will suggest a category based on your description. You can override it here.</p>
                        </div>
                    </div>
                );
            case 'receipts':
                 return (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 3: Attach Receipts</h3>
                        <PhotoUploader />
                    </div>
                );
            case 'review':
                return (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Step 4: Review & Submit</h3>
                        <p className="text-sm text-muted-foreground">Please review all details before submitting. This will create a purchase record in QuickBooks.</p>
                         <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                            <p><strong>Vendor:</strong> Uber</p>
                            <p><strong>Amount:</strong> $45.50</p>
                            <p><strong>Date:</strong> {format(new Date(), "PPP")}</p>
                            <p><strong>Category:</strong> Ground Transportation</p>
                            <p><strong>Purpose:</strong> Ride from office to client meeting at 123 Main St.</p>
                            <p><strong>Receipts:</strong> 1 file attached</p>
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
