
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Sparkles, FileText, DollarSign, ShoppingCart } from 'lucide-react';
import type { ShoppingListItem, OptimizeOrderOutput } from '@/ai/schemas/ordering-schemas';
import { optimizeOrderAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function MicroOrderingTool() {
    const { toast } = useToast();
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
        { name: "Ground Beef", quantity: "10 lbs" },
        { name: "Romaine Lettuce", quantity: "5 heads" },
        { name: "Takeout Containers", quantity: "2 cases" },
    ]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OptimizeOrderOutput | null>(null);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemQuantity) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please enter both an item and a quantity.' });
            return;
        }
        setShoppingList([...shoppingList, { name: newItemName, quantity: newItemQuantity }]);
        setNewItemName('');
        setNewItemQuantity('');
    };

    const handleRemoveItem = (index: number) => {
        setShoppingList(shoppingList.filter((_, i) => i !== index));
    };

    const handleOptimizeOrder = async () => {
        if (shoppingList.length === 0) {
            toast({ variant: 'destructive', title: 'Empty List', description: 'Please add items to your shopping list first.' });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await optimizeOrderAction({ shoppingList });
            if (response.error || !response.data) {
                throw new Error(response.error || "Failed to get optimization from AI.");
            }
            setResult(response.data);
            toast({ title: 'Order Optimized!', description: "The AI has created a cost-saving recommendation for you." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ShoppingCart /> Micro-Ordering & Price Optimizer</CardTitle>
                    <CardDescription>Build your shopping list, then let the AI find the best price for each item across your approved suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="grid gap-1.5 flex-1">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input id="item-name" placeholder="e.g., Avocados" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="item-quantity">Quantity</Label>
                            <Input id="item-quantity" placeholder="e.g., 1 case" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} />
                        </div>
                        <div className="self-end">
                            <Button type="submit" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add to List</Button>
                        </div>
                    </form>
                    
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shoppingList.length > 0 ? (
                                    shoppingList.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Your shopping list is empty.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleOptimizeOrder} disabled={isLoading || shoppingList.length === 0} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Optimize My Order
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <Card className="border-primary bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles /> AI Optimized Order Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <Alert variant="default" className="bg-background">
                            <DollarSign className="h-4 w-4" />
                            <AlertTitle className="font-bold text-lg">Estimated Savings: ${result.totalSavings.toFixed(2)}</AlertTitle>
                            <AlertDescription>{result.reasoning}</AlertDescription>
                        </Alert>
                        <div className="grid md:grid-cols-2 gap-6">
                            {result.recommendation.map(supplierOrder => (
                                <Card key={supplierOrder.supplierName}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><FileText /> Order from: {supplierOrder.supplierName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {supplierOrder.items.map(item => (
                                                    <TableRow key={item.name}>
                                                        <TableCell className="font-medium">{item.name}<br/><span className="text-xs text-muted-foreground">{item.quantity}</span></TableCell>
                                                        <TableCell>{item.priceInfo}</TableCell>
                                                        <TableCell className="text-right font-mono">${item.totalPrice.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter className="bg-muted/50 p-3 flex justify-end">
                                        <p className="font-bold">Subtotal: ${supplierOrder.totalCost.toFixed(2)}</p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
