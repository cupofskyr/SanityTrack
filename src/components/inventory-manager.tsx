
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type InventoryItem = {
    id: number;
    name: string;
    par: number;
};

export default function InventoryManager() {
    const { toast } = useToast();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
        { id: 1, name: 'Bread Loaves', par: 20 },
        { id: 2, name: 'Milk Cartons', par: 12 },
    ]);
    const [newItem, setNewItem] = useState({ name: '', par: '' });
    const [countingFrequency, setCountingFrequency] = useState('1');

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
        setInventoryItems([...inventoryItems, { ...newItem, id: newId, par: parseInt(newItem.par, 10) }]);
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

    return (
        <div className="space-y-6">
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
            
            <Separator />

            <h3 className="text-lg font-medium">Current Inventory List</h3>
             <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Par Level</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventoryItems.length > 0 ? (
                            inventoryItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.par}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No inventory items added yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
