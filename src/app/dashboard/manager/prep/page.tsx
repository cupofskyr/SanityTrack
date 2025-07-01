
"use client";

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StaffMealManager from '@/components/staff-meal-manager';
import { Tag } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function PrepPage() {
    const [isLabelPrintOpen, setIsLabelPrintOpen] = useState(false);
    const [labelItem, setLabelItem] = useState('');
    const [labelQuantity, setLabelQuantity] = useState('');

    const handlePrintLabel = (e: FormEvent) => {
        e.preventDefault();
        if (!labelItem || !labelQuantity) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Print Label</title>
                    <style>
                        @page { size: 3in 2in; margin: 0.1in; }
                        body { font-family: sans-serif; text-align: center; margin-top: 0.2in; }
                        .label { border: 2px solid black; padding: 0.2in; width: 2.6in; height: 1.6in; display: flex; flex-direction: column; justify-content: space-around;}
                        .item-name { font-size: 16pt; font-weight: bold; }
                        .date { font-size: 12pt; }
                        .qty { font-size: 10pt; color: grey; }
                    </style>
                    </head>
                    <body>
                        <div class="label">
                            <div class="item-name">${labelItem}</div>
                            <div class="qty">QTY: ${labelQuantity}</div>
                            <div class="date">USE BY: ${format(addDays(new Date(), 7), 'MM/dd/yy')}</div>
                        </div>
                        <script>window.onload = function() { window.print(); window.close(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            setIsLabelPrintOpen(false);
            setLabelItem('');
            setLabelQuantity('');
        }
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Tag/> Food Labeling</CardTitle>
                    <CardDescription>Generate and print "Use By" labels for received inventory items to ensure proper rotation and safety.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isLabelPrintOpen} onOpenChange={setIsLabelPrintOpen}>
                        <DialogTrigger asChild>
                            <Button><Tag className="mr-2 h-4 w-4"/> Print New Label</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Print Food Label</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handlePrintLabel} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="label-item">Item Name</Label>
                                    <Input id="label-item" value={labelItem} onChange={e => setLabelItem(e.target.value)} placeholder="e.g., Sliced Turkey" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="label-qty">Quantity</Label>
                                    <Input id="label-qty" value={labelQuantity} onChange={e => setLabelQuantity(e.target.value)} placeholder="e.g., 2 lbs" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Print Label</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <StaffMealManager />
        </div>
    );
}
