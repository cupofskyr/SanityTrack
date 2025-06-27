
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database, UploadCloud, FileText, Trash2, Loader2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

type Document = {
    id: number;
    name: string;
    type: 'PDF' | 'Image' | 'Document';
    status: 'Processing' | 'Indexed' | 'Error';
};

const initialDocuments: Document[] = [
    { id: 1, name: 'Q3_Menu_Specials.pdf', type: 'PDF', status: 'Indexed' },
    { id: 2, name: 'new_closing_checklist.jpg', type: 'Image', status: 'Indexed' },
];

export default function KnowledgeBaseManager() {
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Document | null>(null);
    

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileToUpload) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a file to upload.' });
            return;
        }

        const newDoc: Document = {
            id: Date.now(),
            name: fileToUpload.name,
            type: fileToUpload.type.includes('pdf') ? 'PDF' : fileToUpload.type.startsWith('image/') ? 'Image' : 'Document',
            status: 'Processing'
        };

        setDocuments(prev => [...prev, newDoc]);
        setIsUploadDialogOpen(false);
        setFileToUpload(null);

        // Simulate backend indexing process
        setTimeout(() => {
            setDocuments(prev => prev.map(doc => doc.id === newDoc.id ? { ...doc, status: 'Indexed' } : doc));
            toast({ title: 'Document Indexed', description: `"${newDoc.name}" is now available to the AI.` });
        }, 3000);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setDocuments(docs => docs.filter(doc => doc.id !== itemToDelete.id));
        toast({ variant: 'secondary', title: 'Document Deleted', description: `"${itemToDelete.name}" has been removed.` });
        setItemToDelete(null);
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><Database /> Corporate Knowledge Base</CardTitle>
                        <CardDescription>Upload, manage, and delete operational documents. The AI uses these files as its source of truth for the "Company Brain" assistant.</CardDescription>
                    </div>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload New Document</DialogTitle>
                                <DialogDescription>This document will be indexed and made available to the AI assistant.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="document-file">File (PDF, JPG, PNG)</Label>
                                        <Input
                                            id="document-file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Upload & Index</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.length > 0 ? (
                                documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {doc.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{doc.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={doc.status === 'Indexed' ? 'default' : 'secondary'}>
                                                {doc.status === 'Processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {doc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setItemToDelete(doc)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No documents have been uploaded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/brain">
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Go to Company Brain
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">"{itemToDelete?.name}"</span> and remove it from the AI's knowledge base. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete Document</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
