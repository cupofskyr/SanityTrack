"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

type StaffMealItem = {
    id: number;
    name: string;
    category: 'Food' | 'Drink' | 'Snack';
};

const initialMealItems: StaffMealItem[] = [
    { id: 1, name: 'Turkey Sandwich', category: 'Food' },
    { id: 2, name: 'Apple', category: 'Food' },
    { id: 3, name: 'Bag of Chips', category: 'Snack' },
    { id: 4, name: 'Bottled Water', category: 'Drink' },
    { id: 5, name: 'Protein Bar', category: 'Snack' },
];

export default function StaffMealManager() {
    const { toast } = useToast();
    const [mealItems, setMealItems] = useState<StaffMealItem[]>(initialMealItems);
    const [newItem, setNewItem] = useState({ name: '', category: 'Food' as StaffMealItem['category'] });

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.category) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide an item name and category.',
            });
            return;
        }
        const newId = mealItems.length > 0 ? Math.max(...mealItems.map(item => item.id)) + 1 : 1;
        const newMealItem: StaffMealItem = {
            id: newId,
            name: newItem.name,
            category: newItem.category,
        };
        setMealItems([...mealItems, newMealItem]);
        setNewItem({ name: '', category: 'Food' });
        toast({
            title: 'Meal Item Added',
            description: `${newItem.name} has been added to the approved staff meal list.`,
        });
    };
    
    const handleRemoveItem = (id: number) => {
        const itemToRemove = mealItems.find(item => item.id === id);
        setMealItems(mealItems.filter(item => item.id !== id));
        if (itemToRemove) {
            toast({
                variant: 'secondary',
                title: 'Item Removed',
                description: `${itemToRemove.name} has been removed from the list.`,
            });
        }
    };

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Utensils /> Manage Approved Staff Meals</CardTitle>
                <CardDescription>Define the list of items employees are permitted to log as their staff meal. The policy allows for 2 items per shift. This list is for policy and does not affect inventory counts.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
                    <div className="grid gap-2">
                        <Label htmlFor="meal-item-name">New Item Name</Label>
                        <Input 
                            id="meal-item-name" 
                            placeholder="e.g., Chicken Salad" 
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="meal-item-category">Category</Label>
                        <Select value={newItem.category} onValueChange={(val) => setNewItem({ ...newItem, category: val as StaffMealItem['category'] })}>
                            <SelectTrigger id="meal-item-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Drink">Drink</SelectItem>
                                <SelectItem value="Snack">Snack</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Item
                    </Button>
                </form>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mealItems.length > 0 ? (
                                mealItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
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
                                        No approved meal items defined yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
