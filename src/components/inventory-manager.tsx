
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Sparkles, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { generateShoppingList } from '@/app/actions';
import type { GenerateShoppingListOutput } from '@/ai/schemas/shopping-list-schemas';
import { Textarea } from './ui/textarea';

type InventoryItem = {
    id: number;
    name: string;
    par: number;
    currentCount: number;
};

export default function InventoryManager() {
    const { toast } = useToast();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
        { id: 1, name: 'Bananas (by count)', par: 50, currentCount: 60 },
        { id: 2, name: 'Strawberries (in lbs)', par: 10, currentCount: 5 },
        { id: 3, name: 'Blueberries (in lbs)', par: 8, currentCount: 9 },
        { id: 4, name: 'Skyr (in kg)', par: 15, currentCount: 10 },
        { id: 5, name: 'Protein Powder (in kg)', par: 5, currentCount: 5 },
    ]);
    const [newItem, setNewItem] = useState({ name: '', par: ''});
    const [countingFrequency, setCountingFrequency] = useState('1');

    const [isGenerating, setIsGenerating] = useState(false);
    const [shoppingListResult, setShoppingListResult] = useState<GenerateShoppingListOutput | null>(null);

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
            currentCount: 0,
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
    
    const handleCountChange = (id: number, value: string) => {
        const count = parseInt(value, 10);
        setInventoryItems(
            inventoryItems.map(item =>
                item.id === id ? { ...item, currentCount: isNaN(count) ? 0 : count } : item
            )
        );
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
        return inventoryItems.filter(item => item.currentCount < item.par);
    }, [inventoryItems]);

    const handleGenerateList = async () => {
        setIsGenerating(true);
        setShoppingListResult(null);
        try {
            const itemsToOrder = itemsBelowPar.map(({name, par, currentCount}) => ({name, par, currentCount}));
            const result = await generateShoppingList({ items: itemsToOrder });
            setShoppingListResult(result);
            toast({
                title: 'Shopping List Ready!',
                description: 'The AI has generated your reorder list.',
            });
        } catch (error) {
            console.error("Failed to generate shopping list", error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'There was a problem generating the shopping list.',
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSendEmail = () => {
        toast({
            title: 'Order Email Sent (Simulation)',
            description: 'In a real application, this would send an email to your supplier.',
        });
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Add & Manage Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="item-name">New Item Name</Label>
                            <Input 
                                id="item-name" 
                                placeholder="e.g., Strawberry Boxes" 
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="item-par">Par Level (Ideal Count)</Label>
                            <Input 
                                id="item-par" 
                                type="number" 
                                placeholder="e.g., 15"
                                value={newItem.par}
                                onChange={(e) => setNewItem({ ...newItem, par: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </form>

                    <div className="grid md:w-1/3 gap-2">
                        <Label htmlFor="counting-frequency">Counting Frequency</Label>
                        <Select value={countingFrequency} onValueChange={setCountingFrequency}>
                            <SelectTrigger id="counting-frequency">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Once a week (Sunday)</SelectItem>
                                <SelectItem value="2">Twice a week (Wed, Sun)</SelectItem>
                                <SelectItem value="3">Three times a week (Wed, Fri, Sun)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-primary bg-primary/5">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles /> AI Reorder Assistant</CardTitle>
                    <CardDescription>When items are below par, the AI can generate a shopping list for you. Automated emails and alarms will notify the manager.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center justify-between rounded-lg border bg-card text-card-foreground p-4">
                        <div className='space-y-0.5'>
                            <p className="text-sm font-medium">Inventory Status</p>
                            <p className={cn("text-xs", itemsBelowPar.length > 0 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                                {itemsBelowPar.length} item(s) are below par and require reordering.
                            </p>
                        </div>
                        <Button onClick={handleGenerateList} disabled={isGenerating || itemsBelowPar.length === 0}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                         <Button onClick={handleSendEmail} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
                            <Send className="mr-2 h-4 w-4" /> Send Order Email (Simulated)
                        </Button>
                    </CardFooter>
                 )}
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Current Inventory List</CardTitle>
                    <CardDescription>
                        Update the "Current Count" after receiving a delivery. Adjust "Par Level" to change reorder points. The AI uses this data to create shopping lists.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Par Level</TableHead>
                                    <TableHead>Current Count</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventoryItems.length > 0 ? (
                                    inventoryItems.map((item) => {
                                        const isLow = item.currentCount < item.par;
                                        return (
                                        <TableRow key={item.id} className={cn(isLow && "bg-destructive/10 hover:bg-destructive/20")}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={item.par}
                                                    onChange={(e) => handleParChange(item.id, e.target.value)}
                                                    className="w-24 h-8"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={item.currentCount}
                                                    onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                    className="w-24 h-8"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isLow ? "destructive" : "outline"}>
                                                    {isLow ? "Low Stock" : "OK"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )})
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No inventory items added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
