
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Pencil, GraduationCap, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from './ui/textarea';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  ingredients: string; // Stored as comma-separated string for easy editing
  allergens: string; // Stored as comma-separated string
  imageUrl: string;
};

const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Classic Burger', description: 'A juicy beef patty with lettuce, tomato, onion, and our secret sauce.', ingredients: 'Beef Patty, Lettuce, Tomato, Onion, Bun, Secret Sauce', allergens: 'Gluten, Dairy', imageUrl: 'https://placehold.co/600x400.png' },
  { id: 2, name: 'Vegan Burger', description: 'A plant-based patty that tastes just like the real thing.', ingredients: 'Plant-Based Patty, Lettuce, Tomato, Onion, Vegan Bun, Vegan Sauce', allergens: 'Gluten, Soy', imageUrl: 'https://placehold.co/600x400.png' },
  { id: 3, name: 'Caesar Salad', description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing.', ingredients: 'Romaine Lettuce, Parmesan, Croutons, Caesar Dressing', allergens: 'Gluten, Dairy, Fish', imageUrl: 'https://placehold.co/600x400.png' },
];

type VideoSubmission = {
    id: number;
    user: string;
    item: string;
    time: number;
    location: string;
};

const initialVideoSubmissions: VideoSubmission[] = [
    { id: 1, user: 'John Doe', item: 'Classic Burger', time: 45, location: 'Downtown' },
    { id: 2, user: 'Jane Smith', item: 'Vegan Burger', time: 52, location: 'Uptown' },
    { id: 3, user: 'Sam Wilson', item: 'Fish & Chips', time: 38, location: 'Downtown' },
];

export default function TrainingManager() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

  const [challengeTitle, setChallengeTitle] = useState('Speed Run Challenge');
  const [challengeDescription, setChallengeDescription] = useState("Think you're the fastest? Upload a video of you making a menu item and compete for the top spot on the leaderboard! Each month the #1 ranking gets a 500$ bonus");
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>(initialVideoSubmissions);

  // State for video edit dialog
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  const [currentVideoSubmission, setCurrentVideoSubmission] = useState<VideoSubmission | null>(null);
  const [editedTime, setEditedTime] = useState('');

  // State for delete confirmations
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'menu' | 'video', id: number, name: string} | null>(null);


  const openMenuDialog = (item: MenuItem | null) => {
    setCurrentItem(item ? { ...item } : { id: 0, name: '', description: '', ingredients: '', allergens: '', imageUrl: 'https://placehold.co/600x400.png' });
    setIsMenuDialogOpen(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !currentItem.name || !currentItem.description) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all required fields.' });
        return;
    }

    if (currentItem.id) { // Editing
      setMenuItems(menuItems.map(item => item.id === currentItem.id ? currentItem : item));
      toast({ title: 'Item Updated', description: `"${currentItem.name}" has been successfully updated.` });
    } else { // Adding
      const newItem: MenuItem = { ...currentItem, id: Date.now() };
      setMenuItems([...menuItems, newItem]);
      toast({ title: 'Item Added', description: `"${newItem.name}" has been added to the training game.` });
    }
    setIsMenuDialogOpen(false);
    setCurrentItem(null);
  };
  
  const openDeleteDialog = (type: 'menu' | 'video', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'menu') {
        setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
        toast({ variant: 'secondary', title: 'Item Deleted', description: `"${itemToDelete.name}" has been removed.` });
    } else if (itemToDelete.type === 'video') {
        setVideoSubmissions(videoSubmissions.filter(s => s.id !== itemToDelete.id));
        toast({ variant: 'secondary', title: 'Submission Deleted', description: `The video submission from ${itemToDelete.name} has been removed.` });
    }
    
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  // Add handlers for editing video submission time
  const openEditVideoDialog = (submission: VideoSubmission) => {
    setCurrentVideoSubmission(submission);
    setEditedTime(String(submission.time));
    setIsEditVideoDialogOpen(true);
  };

  const handleSaveEditedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVideoSubmission || editedTime === '') {
        toast({ variant: 'destructive', title: 'Invalid Time', description: 'Please enter a valid time.' });
        return;
    }
    const newTime = parseInt(editedTime, 10);
    if (isNaN(newTime) || newTime < 0) {
        toast({ variant: 'destructive', title: 'Invalid Time', description: 'Please enter a valid positive number for the time.' });
        return;
    }

    setVideoSubmissions(videoSubmissions.map(s => 
        s.id === currentVideoSubmission.id ? { ...s, time: newTime } : s
    ));
    toast({ title: 'Time Updated', description: `The time for ${currentVideoSubmission.user}'s submission has been updated.` });
    setIsEditVideoDialogOpen(false);
    setCurrentVideoSubmission(null);
  };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><GraduationCap /> Menu Training Game Content</CardTitle>
                    <CardDescription>Add, edit, or delete the menu items that appear in the employee training game.</CardDescription>
                </div>
                <Button onClick={() => openMenuDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Menu Item
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-semibold">{item.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-sm">{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openMenuDialog(item)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('menu', item.id, item.name)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Video /> Speed Run Challenge Settings</CardTitle>
                <CardDescription>Update the title and description for the speed run competition.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="challenge-title">Competition Title</Label>
                        <Input id="challenge-title" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="challenge-description">Competition Description</Label>
                        <Textarea id="challenge-description" value={challengeDescription} onChange={(e) => setChallengeDescription(e.target.value)} rows={3} />
                    </div>
                    <Button onClick={() => toast({title: "Settings Saved", description: "The competition details have been updated."})}>Save Challenge Details</Button>
                </form>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Video /> Moderate Speed Run Submissions</CardTitle>
                <CardDescription>Review and remove entries from the leaderboard from all locations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Menu Item</TableHead>
                                <TableHead>Time (s)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videoSubmissions.length > 0 ? (
                                videoSubmissions
                                .sort((a,b) => a.time - b.time)
                                .map(submission => (
                                    <TableRow key={submission.id}>
                                        <TableCell>{submission.user}</TableCell>
                                        <TableCell>{submission.location}</TableCell>
                                        <TableCell>{submission.item}</TableCell>
                                        <TableCell>{submission.time}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditVideoDialog(submission)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit Submission</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('video', submission.id, submission.user)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete Submission</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No video submissions yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>


        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">{currentItem?.id ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the training game. This information does not affect your public menu.
                    </DialogDescription>
                </DialogHeader>
                {currentItem && (
                    <form onSubmit={handleSaveMenuItem}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="item-name">Item Name</Label>
                                <Input id="item-name" value={currentItem.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item-description">Description</Label>
                                <Textarea id="item-description" value={currentItem.description} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item-ingredients">Ingredients (comma-separated)</Label>
                                <Input id="item-ingredients" placeholder="e.g., Beef Patty, Lettuce, Tomato" value={currentItem.ingredients} onChange={(e) => setCurrentItem({...currentItem, ingredients: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item-allergens">Allergens (comma-separated)</Label>
                                <Input id="item-allergens" placeholder="e.g., Gluten, Dairy" value={currentItem.allergens} onChange={(e) => setCurrentItem({...currentItem, allergens: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item-image">Image URL</Label>
                                <Input id="item-image" value={currentItem.imageUrl} onChange={(e) => setCurrentItem({...currentItem, imageUrl: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsMenuDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Item</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>

        {/* Add the new dialog for editing video time */}
        <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Edit Submission Time</DialogTitle>
                    <DialogDescription>
                        Correct the time for the submission by {currentVideoSubmission?.user} for the item "{currentVideoSubmission?.item}".
                    </DialogDescription>
                </DialogHeader>
                {currentVideoSubmission && (
                    <form onSubmit={handleSaveEditedTime}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="submission-time">Time (in seconds)</Label>
                                <Input
                                    id="submission-time"
                                    type="number"
                                    value={editedTime}
                                    onChange={(e) => setEditedTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsEditVideoDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Time</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the {itemToDelete?.type === 'menu' ? 'menu item' : 'submission from'} <span className="font-semibold">"{itemToDelete?.name}"</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
