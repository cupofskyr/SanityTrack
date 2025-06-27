
"use client";

import { useState, useMemo, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Sparkles, Loader2, Send, Package, Link as LinkIcon, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { generateShoppingListAction, scanInvoiceAction } from '@/app/actions';
import type { GenerateShoppingListOutput } from '@/ai/schemas/shopping-list-schemas';
import type { ScannedItem as ScannedItemType } from '@/ai/schemas/invoice-scan-schemas';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { add, format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from './ui/dialog';
import PhotoUploader from './photo-uploader';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type Batch = {
    id: string;
    quantity: number;
    receivedAt: Date;
    expiresAt: Date;
};

type InventoryItem = {
    id: number;
    name: string;
    par: number;
    batches: Batch[];
};

type ScannedItem = {
    itemName: string;
    quantity: number;
    matched: boolean;
};

const initialInventory: InventoryItem[] = [
    { id: 1, name: 'Bananas (by count)', par: 50, batches: [
        { id: 'b1', quantity: 30, receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), expiresAt: add(new Date(), { days: 4 }) },
        { id: 'b2', quantity: 30, receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), expiresAt: add(new Date(), { days: 6 }) },
    ]},
    { id: 2, name: 'Strawberries (in lbs)', par: 10, batches: [
        { id: 's1', quantity: 5, receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), expiresAt: add(new Date(), { days: 3 }) },
    ]},
    { id: 3, name: 'Skyr (in kg)', par: 15, batches: [
        { id: 'sk1', quantity: 10, receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), expiresAt: add(new Date(), { days: 10 }) },
    ]},
];

export default function InventoryManager() {
    const { toast } = useToast();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventory);
    const [newItem, setNewItem] = useState({ name: '', par: ''});
    
    // AI Reorder state
    const [isGeneratingList, setIsGeneratingList] = useState(false);
    const [shoppingListResult, setShoppingListResult] = useState<GenerateShoppingListOutput | null>(null);

    // AI Receiving state
    const [isReceivingDialogOpen, setIsReceivingDialogOpen] = useState(false);
    const [invoicePhoto, setInvoicePhoto] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.par) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide both an item name and a par level.',
            });
            return;
        }
        const newId = inventoryItems.length > 0 ? Math.max(...inventoryItems.map(item => item.id)) + 1 : 1;
        const newInventoryItem: InventoryItem = {
            id: newId,
            name: newItem.name,
            par: parseInt(newItem.par, 10),
            batches: [],
        };
        setInventoryItems([...inventoryItems, newInventoryItem]);
        setNewItem({ name: '', par: '' });
        toast({
            title: 'Item Added',
            description: `${newItem.name} has been added to the inventory list.`,
        });
    };
    
    const handleRemoveItem = (id: number) => {
        const itemToRemove = inventoryItems.find(item => item.id === id);
        setInventoryItems(inventoryItems.filter(item => item.id !== id));
        if (itemToRemove) {
            toast({
                variant: 'secondary',
                title: 'Item Removed',
                description: `${itemToRemove.name} has been removed from the inventory list.`,
            });
        }
    };
    
    const handleParChange = (id: number, value: string) => {
        const par = parseInt(value, 10);
        setInventoryItems(
            inventoryItems.map(item =>
                item.id === id ? { ...item, par: isNaN(par) ? 0 : par } : item
            )
        );
    };

    const itemsBelowPar = useMemo(() => {
        return inventoryItems.filter(item => {
            const currentCount = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
            return currentCount < item.par;
        }).map(item => ({
            ...item,
            currentCount: item.batches.reduce((sum, batch) => sum + batch.quantity, 0)
        }));
    }, [inventoryItems]);

    const handleGenerateList = async () => {
        setIsGeneratingList(true);
        setShoppingListResult(null);
        try {
            const itemsToOrder = itemsBelowPar.map(({name, par, currentCount}) => ({name, par, currentCount}));
            const result = await generateShoppingListAction({ items: itemsToOrder });
            if (result.error || !result.data) {
                toast({
                    variant: 'destructive',
                    title: 'AI Error',
                    description: result.error || 'There was a problem generating the shopping list.',
                });
            } else {
                setShoppingListResult(result.data);
                toast({
                    title: 'Shopping List Ready!',
                    description: 'The AI has generated your reorder list.',
                });
            }
        } catch (error) {
            console.error("Failed to generate shopping list", error);
        } finally {
            setIsGeneratingList(false);
        }
    };
    
    const handleSubmitPurchaseOrder = () => {
        if (!shoppingListResult) return;
        const newPO = {
            id: `po-${Date.now()}`,
            locationName: "Downtown", // In real app, get from context
            submittedBy: "Demo Manager", // In real app, get from context
            subject: shoppingListResult.subject,
            list: shoppingListResult.shoppingList
        };

        const existingPOs = JSON.parse(localStorage.getItem('pendingPurchaseOrders') || '[]');
        localStorage.setItem('pendingPurchaseOrders', JSON.stringify([newPO, ...existingPOs]));
        
        toast({
            title: 'Purchase Order Submitted!',
            description: 'The owner has been notified and will review your request.',
        });
        setShoppingListResult(null);
    };
    
    const handleScanInvoice = async () => {
        if (!invoicePhoto) return;
        setIsScanning(true);
        setScannedItems([]);
        try {
            const knownItems = inventoryItems.map(item => item.name);
            const result = await scanInvoiceAction({ invoiceImageUri: invoicePhoto, knownItems });
            if (result.error || !result.data) {
                throw new Error(result.error || "Failed to scan invoice");
            }

            const processedItems = result.data.scannedItems.map(scanned => ({
                name: scanned.itemName,
                quantity: scanned.quantity,
                matched: knownItems.some(known => known.toLowerCase().includes(scanned.itemName.toLowerCase()) || scanned.itemName.toLowerCase().includes(known.toLowerCase()))
            }));
            
            setScannedItems(processedItems);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Scan Failed', description: error.message });
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirmDelivery = () => {
        const updatedItems = [...inventoryItems];

        scannedItems.forEach(scannedItem => {
            const itemIndex = updatedItems.findIndex(invItem => 
                invItem.name.toLowerCase().includes(scannedItem.itemName.toLowerCase()) || 
                scannedItem.itemName.toLowerCase().includes(invItem.name.toLowerCase())
            );

            if (itemIndex > -1) {
                const newBatch: Batch = {
                    id: `${updatedItems[itemIndex].id}-${Date.now()}`,
                    quantity: scannedItem.quantity,
                    receivedAt: new Date(),
                    // Shelf life is hardcoded to 7 days for this demo
                    expiresAt: add(new Date(), { days: 7 })
                };
                updatedItems[itemIndex].batches.push(newBatch);
            }
        });

        setInventoryItems(updatedItems);
        toast({ title: "Inventory Updated!", description: "New batches have been added from the invoice."});
        
        // Reset dialog state
        setIsReceivingDialogOpen(false);
        setInvoicePhoto(null);
        setScannedItems([]);
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline">Add & Manage Inventory</CardTitle>
                        <CardDescription>Add new items to track. Batches are added via the "Receive Inventory" feature.</CardDescription>
                    </div>
                     <Dialog open={isReceivingDialogOpen} onOpenChange={setIsReceivingDialogOpen}>
                        <DialogTrigger asChild>
                             <Button><Download className="mr-2 h-4 w-4" /> Receive Inventory</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                             <DialogHeader>
                                <DialogTitle className="font-headline">AI-Assisted Receiving</DialogTitle>
                                <DialogDescription>Take a photo of a paper invoice. The AI will scan it and help you update your stock levels.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                               <PhotoUploader onPhotoDataChange={setInvoicePhoto} />
                               {invoicePhoto && (
                                   <Button className="w-full" onClick={handleScanInvoice} disabled={isScanning}>
                                       {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                       Scan Invoice with AI
                                   </Button>
                               )}
                                {scannedItems.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Scanned Items</Label>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Item Name</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {scannedItems.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{item.itemName}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={item.matched ? 'default' : 'destructive'}>{item.matched ? 'Matched' : 'Unmatched'}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <p className="text-xs text-muted-foreground">Unmatched items will be ignored. Add them to your inventory list first if you wish to track them.</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsReceivingDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleConfirmDelivery} disabled={scannedItems.length === 0}>Confirm & Add to Inventory</Button>
                            </DialogFooter>
                        </DialogContent>
                     </Dialog>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="item-name">New Item Name</Label>
                            <Input id="item-name" placeholder="e.g., Protein Powder (kg)" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="item-par">Par Level (Ideal Count)</Label>
                            <Input id="item-par" type="number" placeholder="e.g., 5" value={newItem.par} onChange={(e) => setNewItem({ ...newItem, par: e.target.value })}/>
                        </div>
                        <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                    </form>
                </CardContent>
            </Card>

             <Alert variant="default" className="bg-primary/5 border-primary/20 text-primary [&>svg]:text-primary">
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="font-semibold">Unlock Live Inventory!</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    Tired of manual counts? Connect your POS to enable real-time, automated inventory tracking.
                    <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
                        <LinkIcon className="mr-2 h-4 w-4" /> Connect your POS
                    </Button>
                </AlertDescription>
            </Alert>


            <Card className="lg:col-span-3 border-primary bg-primary/5">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles /> AI Reorder Assistant</CardTitle>
                    <CardDescription>When items are below par, the AI can generate a shopping list for you. Connect your POS to unlock predictive ordering based on sales trends.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center justify-between rounded-lg border bg-card text-card-foreground p-4">
                        <div className='space-y-0.5'>
                            <p className="text-sm font-medium">Inventory Status</p>
                            <p className={cn("text-xs", itemsBelowPar.length > 0 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                                {itemsBelowPar.length} item(s) are below par and require reordering.
                            </p>
                        </div>
                        <Button onClick={handleGenerateList} disabled={isGeneratingList || itemsBelowPar.length === 0}>
                            {isGeneratingList && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Shopping List
                        </Button>
                    </div>

                    {shoppingListResult && (
                        <div className="mt-4 space-y-4">
                             <div className="grid gap-2">
                                <Label htmlFor="email-subject">Generated Email Subject</Label>
                                <Input id="email-subject" readOnly value={shoppingListResult.subject} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shopping-list">Generated Shopping List</Label>
                                <Textarea id="shopping-list" readOnly value={shoppingListResult.shoppingList} rows={8} />
                            </div>
                           
                        </div>
                    )}
                </CardContent>
                 {shoppingListResult && (
                    <CardFooter>
                         <Button onClick={handleSubmitPurchaseOrder} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
                            <Send className="mr-2 h-4 w-4" /> Submit Purchase Order for Approval
                        </Button>
                    </CardFooter>
                 )}
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Current Inventory & Batches</CardTitle>
                    <CardDescription>
                        This is the master list of all inventory. The current count is the sum of all its batches. FIFO is used for depletion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Accordion type="multiple" className="w-full">
                    {inventoryItems.map(item => {
                        const totalCount = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
                        const isLow = totalCount < item.par;
                        return (
                            <AccordionItem value={`item-${item.id}`} key={item.id}>
                                <AccordionTrigger className={cn("hover:no-underline", isLow && "bg-destructive/10 px-4 rounded-t-md")}>
                                    <div className="flex-1 text-left">
                                        <div className="flex justify-between w-full">
                                            <span className="font-semibold">{item.name}</span>
                                            <Badge variant={isLow ? "destructive" : "outline"}>
                                                {totalCount} / {item.par}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Batch Quantity</TableHead>
                                                <TableHead>Received</TableHead>
                                                <TableHead>Expires</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {item.batches.length > 0 ? (
                                                item.batches.sort((a,b) => a.receivedAt.getTime() - b.receivedAt.getTime()).map(batch => (
                                                <TableRow key={batch.id}>
                                                    <TableCell>{batch.quantity}</TableCell>
                                                    <TableCell>{formatDistanceToNow(batch.receivedAt, { addSuffix: true })}</TableCell>
                                                    <TableCell>{formatDistanceToNow(batch.expiresAt, { addSuffix: true })}</TableCell>
                                                </TableRow>
                                            ))) : (
                                                 <TableRow><TableCell colSpan={3} className="text-center h-16">No batches. Use "Receive Inventory".</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                   </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
