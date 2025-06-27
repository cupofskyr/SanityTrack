
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle, XCircle, PlusCircle, Pencil, Trash2, Send, ShieldCheck, Clock, Settings, BellRing } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PhotoUploader from '@/components/photo-uploader';
import { compareFoodQualityAction } from '@/app/actions';
import type { CompareFoodQualityOutput } from '@/ai/schemas/food-quality-schemas';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type StandardItem = {
    id: number;
    name: string;
    imageUrl: string; // Can be a public URL or a base64 data URI
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

// Mock team members for task assignment
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<StandardItem | null>(null);

    // State for the audit tool
    const [selectedStandard, setSelectedStandard] = useState<StandardItem | undefined>(standardItems[0]);
    const [auditPhotoUri, setAuditPhotoUri] = useState<string | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<CompareFoodQualityOutput | null>(null);
    
    // State for task creation
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [taskAssignee, setTaskAssignee] = useState('');
    
    // State for QA Rules
    const [alertThreshold, setAlertThreshold] = useState(7);
    const [isKdsAlertEnabled, setIsKdsAlertEnabled] = useState(true);

    const locationId = "Downtown"; // In a real app, this would come from the manager's context.

    useEffect(() => {
        if (!selectedStandard && standardItems.length > 0) {
            setSelectedStandard(standardItems[0]);
        } else if (standardItems.length === 0) {
            setSelectedStandard(undefined);
        }
    }, [standardItems, selectedStandard]);


    const openMenuDialog = (item: StandardItem | null) => {
        setCurrentItem(item ? { ...item } : { id: 0, name: '', imageUrl: '' });
        setIsMenuDialogOpen(true);
    };

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
            const newItem: StandardItem = { ...currentItem, id: Date.now() };
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
        if (selectedStandard?.id === itemToDelete.id) {
            setSelectedStandard(standardItems.length > 1 ? standardItems.find(i => i.id !== itemToDelete.id) : undefined);
        }
        toast({ variant: 'secondary', title: 'Standard Deleted', description: `"${itemToDelete.name}" has been removed.` });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleAudit = async () => {
        if (!selectedStandard || !auditPhotoUri) {
            toast({ variant: 'destructive', title: "Missing Input", description: "Please select a standard and upload a photo." });
            return;
        }
        setIsAuditing(true);
        setAuditResult(null);

        try {
            const { data, error } = await compareFoodQualityAction({
                standardImageUri: selectedStandard.imageUrl,
                actualImageUri: auditPhotoUri,
                itemName: selectedStandard.name
            });

            if (error || !data) throw new Error(error || "Failed to get AI audit result.");
            setAuditResult(data);
            toast({ title: "AI Audit Complete", description: "The quality report is ready for review." });

            // Check against rules
            if (data.score < alertThreshold) {
                dispatchQaAlert(data);
            }

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: "Audit Failed", description: error.message });
        } finally {
            setIsAuditing(false);
        }
    };
    
    // This simulates the `dispatchQaAlert` Cloud Function
    const dispatchQaAlert = (result: CompareFoodQualityOutput) => {
        toast({
            variant: "destructive",
            title: "QA Alert Triggered!",
            description: "Notifications have been dispatched (Simulated)."
        });

        // 1. SMS to Manager (Simulated) - We show a toast in the main app
        // 2. Write to KDS (Simulated via localStorage)
        if (isKdsAlertEnabled) {
            const kdsAlertData = {
                itemName: selectedStandard?.name,
                score: result.score,
                feedback: result.feedback,
                deviations: result.deviations,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(`kds-alert-${locationId}`, JSON.stringify(kdsAlertData));
        }
        
        // 3. Create Employee Task (Simulated via localStorage)
        const qaTask = {
            id: Date.now(),
            description: `Quality score for "${selectedStandard?.name}" was ${result.score}/10. Please review with manager.`,
            source: 'QA Sentinel',
            status: 'Pending'
        };
        // In a real app you'd add this to a shared employee task list in Firestore.
        localStorage.setItem('qa-employee-task', JSON.stringify(qaTask));

        // 4. Log for Owner (Simulated via localStorage)
        const auditLog = {
            id: Date.now(),
            location: locationId,
            item: selectedStandard?.name,
            score: result.score,
            timestamp: new Date().toISOString()
        };
        const existingLogs = JSON.parse(localStorage.getItem('qa-audit-log') || '[]');
        localStorage.setItem('qa-audit-log', JSON.stringify([auditLog, ...existingLogs]));
    };

    const handleCreateTask = () => {
        if (!auditResult || !taskAssignee) {
             toast({ variant: 'destructive', title: "Missing Information", description: "Please select an employee to assign the task to." });
            return;
        }
        toast({
            title: "Task Created!",
            description: `A follow-up task has been assigned to ${taskAssignee}.`
        });
        setIsTaskDialogOpen(false);
        setTaskAssignee('');
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Settings/> QA Rules Engine</CardTitle>
                    <CardDescription>Configure rules for automated QA checks and alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center space-x-4 rounded-lg border p-4">
                        <BellRing className="h-6 w-6"/>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">KDS Kitchen Alarm</p>
                            <p className="text-sm text-muted-foreground">
                                Trigger a loud, audible alarm on the paired KDS display for critical QA failures.
                            </p>
                        </div>
                        <Switch checked={isKdsAlertEnabled} onCheckedChange={setIsKdsAlertEnabled} />
                    </div>
                     <div className="flex items-center space-x-4 rounded-lg border p-4">
                         <ShieldCheck className="h-6 w-6"/>
                         <div className="flex-1 space-y-1">
                             <Label htmlFor="alert-threshold" className="text-sm font-medium leading-none">Instant Alert Threshold</Label>
                             <p className="text-sm text-muted-foreground">
                                If an AI quality score is below this value, an instant alert will be triggered.
                             </p>
                         </div>
                         <Input id="alert-threshold" type="number" value={alertThreshold} onChange={e => setAlertThreshold(Number(e.target.value))} className="w-20" />
                     </div>
                      <div className="flex items-center space-x-4 rounded-lg border p-4">
                         <Clock className="h-6 w-6"/>
                         <div className="flex-1 space-y-1">
                             <p className="text-sm font-medium leading-none">Scheduled Audits</p>
                             <p className="text-sm text-muted-foreground">
                                Require mandatory QA checks for items at specific times during a shift.
                             </p>
                         </div>
                         <Button variant="secondary" disabled>Configure Schedule</Button>
                     </div>
                </CardContent>
            </Card>

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
                    <CardTitle className="font-headline">AI Quality Control Audit</CardTitle>
                    <CardDescription>Compare a freshly prepared dish against its "golden standard" photo to ensure presentation consistency.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Golden Standard</h3>
                        <Select value={selectedStandard?.name} onValueChange={(name) => { setSelectedStandard(standardItems.find(item => item.name === name)!); setAuditResult(null); }} disabled={standardItems.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Select a menu item..." /></SelectTrigger>
                            <SelectContent>{standardItems.map(item => (<SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted">
                            {selectedStandard && <Image src={selectedStandard.imageUrl} alt={`Golden standard for ${selectedStandard.name}`} layout="fill" objectFit="cover" data-ai-hint="food presentation" />}
                             {!selectedStandard && <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select a standard</div>}
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold">Dish to Audit</h3>
                        <PhotoUploader onPhotoDataChange={setAuditPhotoUri} />
                        <Button className="w-full" onClick={handleAudit} disabled={isAuditing || !auditPhotoUri || !selectedStandard}>
                            {isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Audit with AI
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {auditResult && (
                <Card>
                    <CardHeader><CardTitle className="font-headline">AI Audit Report</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Quality Score</p>
                            <p className="text-4xl font-bold text-primary">{auditResult.score}/10</p>
                        </div>
                        <Alert variant={auditResult.score > 7 ? "default" : "destructive"}>
                            {auditResult.score > 7 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle>Chef's Feedback</AlertTitle>
                            <AlertDescription>{auditResult.feedback}</AlertDescription>
                        </Alert>
                         {auditResult.deviations.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Identified Deviations:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                                    {auditResult.deviations.map((dev, i) => <li key={i}>{dev}</li>)}
                                </ul>
                            </div>
                         )}
                    </CardContent>
                    <CardFooter>
                         <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                            <DialogTrigger asChild><Button variant="secondary"><PlusCircle className="mr-2 h-4 w-4" /> Create Follow-up Task</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Follow-up Task</DialogTitle>
                                    <DialogDescription>Assign a retraining or correction task based on this audit.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Task Summary</Label>
                                        <Textarea readOnly defaultValue={`Quality issue on "${selectedStandard?.name}". Score: ${auditResult.score}/10. Feedback: ${auditResult.feedback}`} rows={4}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="task-assignee">Assign To</Label>
                                        <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                                            <SelectTrigger id="task-assignee"><SelectValue placeholder="Select an employee..." /></SelectTrigger>
                                            <SelectContent>{teamMembers.map(emp => <SelectItem key={emp.name} value={emp.name}>{emp.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter><Button onClick={handleCreateTask} disabled={!taskAssignee}><Send className="mr-2 h-4 w-4" /> Assign Task</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            )}
            
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
                                <div className="grid gap-2"><Label>Reference Photo</Label><PhotoUploader initialPreview={currentItem.imageUrl ? { url: currentItem.imageUrl, name: "reference.png" } : undefined} onPhotoDataChange={(dataUrl) => setCurrentItem({...currentItem, imageUrl: dataUrl || ''})} /></div>
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
