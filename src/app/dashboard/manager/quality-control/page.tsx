"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Pencil, Trash2, ShieldCheck, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PhotoUploader from '@/components/photo-uploader';

type StandardItem = {
    id: number;
    name: string;
    imageUrl: string;
};

const initialGoldenStandardItems: StandardItem[] = [
    {
        id: 1,
        name: "Classic Burger",
        imageUrl: "https://storage.googleapis.com/gen-ai-recipes/golden-burger.jpg"
    },
    {
        id: 2,
        name: "Caesar Salad",
        imageUrl: "https://storage.googleapis.com/gen-ai-recipes/golden-salad.jpg"
    }
];

const teamMembers = [
    { name: "John Doe" },
    { name: "Jane Smith" },
    { name: "Sam Wilson" },
];

export default function QualityControlPage() {
    const { toast } = useToast();
    
    // State for managing standards
    const [standardItems, setStandardItems] = useState<StandardItem[]>(initialGoldenStandardItems);
    const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<StandardItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<StandardItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // State for task assignment
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [assignment, setAssignment] = useState({ itemId: '', employeeName: '' });

    const openMenuDialog = (item: StandardItem | null) => {
        setCurrentItem(item ? { ...item } : { id: 0, name: '', imageUrl: '' });
        setIsMenuDialogOpen(true);
    };

    const handlePhotoDataChange = useCallback((dataUrl: string | null) => {
        setCurrentItem(prev => prev ? { ...prev, imageUrl: dataUrl || '' } : null);
    }, []);

    const handleSaveMenuItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem || !currentItem.name || !currentItem.imageUrl) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide a name and upload an image.' });
            return;
        }

        if (currentItem.id) { // Editing
            setStandardItems(standardItems.map(item => item.id === currentItem.id ? currentItem : item));
            toast({ title: 'Standard Updated', description: `"${currentItem.name}" has been updated.` });
        } else { // Adding
            const newItem: StandardItem = { ...currentItem, id: Date.now(), imageUrl: currentItem.imageUrl || 'https://placehold.co/600x400.png' };
            setStandardItems([...standardItems, newItem]);
            toast({ title: 'Standard Added', description: `"${newItem.name}" has been added.` });
        }
        setIsMenuDialogOpen(false);
        setCurrentItem(null);
    };

    const openDeleteDialog = (item: StandardItem) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setStandardItems(items => items.filter(item => item.id !== itemToDelete.id));
        toast({ variant: 'secondary', title: 'Standard Deleted', description: `"${itemToDelete.name}" has been removed.` });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    };
    
    const handleAssignTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignment.itemId || !assignment.employeeName) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select an item and an employee.'});
            return;
        }

        const selectedItem = standardItems.find(item => item.id === parseInt(assignment.itemId));
        if (!selectedItem) return;

        const qaTask = {
            id: Date.now(),
            description: `Perform mandatory QA check for: ${selectedItem.name}`,
            source: 'Manager Assignment',
            status: 'Pending',
            itemToAudit: selectedItem.name,
            standardImageUrl: selectedItem.imageUrl,
            type: 'qa'
        };

        // In a real app you'd write to a shared DB. Here we use localStorage.
        localStorage.setItem('qa-employee-task', JSON.stringify(qaTask));

        toast({
            title: "QA Task Assigned!",
            description: `A quality check for "${selectedItem.name}" has been assigned to ${assignment.employeeName}.`
        });

        setIsAssignDialogOpen(false);
        setAssignment({ itemId: '', employeeName: '' });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline">Manage Golden Standards</CardTitle>
                        <CardDescription>Add, edit, or remove the reference items for quality audits.</CardDescription>
                    </div>
                    <Button onClick={() => openMenuDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Standard
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Menu Item</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {standardItems.length > 0 ? (
                                standardItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openMenuDialog(item)}><Pencil className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={2} className="text-center h-24 text-muted-foreground">No golden standard items have been created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ShieldCheck/> Assign QA Checks</CardTitle>
                    <CardDescription>Assign a mandatory quality control check to an employee. They will be prompted to perform the audit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Assign New QA Check
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assign Quality Check Task</DialogTitle>
                                <DialogDescription>Select an item and an employee to perform the audit.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAssignTask} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="qa-item">Menu Item to Check</Label>
                                    <Select value={assignment.itemId} onValueChange={(val) => setAssignment(prev => ({...prev, itemId: val}))}>
                                        <SelectTrigger id="qa-item"><SelectValue placeholder="Select an item..."/></SelectTrigger>
                                        <SelectContent>
                                            {standardItems.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qa-employee">Assign To</Label>
                                    <Select value={assignment.employeeName} onValueChange={(val) => setAssignment(prev => ({...prev, employeeName: val}))}>
                                        <SelectTrigger id="qa-employee"><SelectValue placeholder="Select an employee..."/></SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map(emp => <SelectItem key={emp.name} value={emp.name}>{emp.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit"><Send className="mr-2 h-4 w-4" />Assign Task</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
            
            <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentItem?.id ? "Edit" : "Add"} Golden Standard</DialogTitle>
                        <DialogDescription>{currentItem?.id ? "Update the details for this standard." : "Add a new reference item for quality checks."}</DialogDescription>
                    </DialogHeader>
                    {currentItem && (
                         <form onSubmit={handleSaveMenuItem}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label htmlFor="item-name">Menu Item Name</Label><Input id="item-name" value={currentItem.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} required/></div>
                                <div className="grid gap-2"><Label>Reference Photo</Label><PhotoUploader initialPreview={currentItem.imageUrl ? { url: currentItem.imageUrl, name: "reference.png" } : undefined} onPhotoDataChange={handlePhotoDataChange} /></div>
                            </div>
                            <DialogFooter><Button type="button" variant="secondary" onClick={() => setIsMenuDialogOpen(false)}>Cancel</Button><Button type="submit">Save Standard</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the golden standard for <span className="font-semibold">"{itemToDelete?.name}"</span>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
