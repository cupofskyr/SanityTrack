"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, AlertTriangle, Sparkles, Flag, Phone, Wrench, PlusCircle, ExternalLink } from "lucide-react";
import AIRecommendationForm from "@/components/ai-recommendation-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


const teamMembers = [
    { name: "John Doe", tasksCompleted: 8, tasksPending: 2, progress: 80 },
    { name: "Jane Smith", tasksCompleted: 5, tasksPending: 5, progress: 50 },
    { name: "Sam Wilson", tasksCompleted: 10, tasksPending: 0, progress: 100 },
];

const highPriorityIssues = [
    { id: 1, description: "Major leak in the kitchen storage area.", reportedBy: "Jane Smith", category: "Plumbing", contactType: "Plumber" },
    { id: 2, description: "Freezer unit temperature is above safety limits.", reportedBy: "System Alert", category: "Electrical", contactType: "Electrician" },
    { id: 3, description: "Reports of rodent activity in the dry stock room.", reportedBy: "John Doe", category: "Pest Control", contactType: "Pest Control" },
];

const initialContacts = [
    { id: 1, name: "Joe's Plumbing", type: "Plumber", phone: "555-123-4567" },
    { id: 2, name: "Sparky Electric", type: "Electrician", phone: "555-987-6543" },
];

type Contact = {
    id: number;
    name: string;
    type: string;
    phone: string;
};

export default function ManagerDashboard() {
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', type: '', phone: '' });

    const findContact = (type: string) => contacts.find(c => c.type === type);

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.name || !newContact.type || !newContact.phone) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all contact fields.",
            });
            return;
        }
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        setContacts([...contacts, { ...newContact, id: newId }]);
        setNewContact({ name: '', type: '', phone: '' });
        setIsAddContactOpen(false);
        toast({
            title: "Contact Added",
            description: "The new service contact has been saved.",
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users /> Team Overview</CardTitle>
                    <CardDescription>Track the performance and task completion of your team members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamMembers.map(member => (
                        <div key={member.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-sm text-muted-foreground">{member.tasksCompleted} / {member.tasksCompleted + member.tasksPending} tasks</span>
                            </div>
                            <Progress value={member.progress} className="h-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> High-Priority Issues</CardTitle>
                    <CardDescription>Critical issues that require immediate attention and AI-powered suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {highPriorityIssues.map(issue => {
                        const contact = findContact(issue.contactType);
                        return (
                            <Alert key={issue.id} variant="destructive" className="bg-accent/10 border-accent text-accent [&>svg]:text-accent">
                                <Flag className="h-4 w-4" />
                                <AlertTitle className="font-bold">{issue.description}</AlertTitle>
                                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                        <p>Reported by: {issue.reportedBy}</p>
                                        <p className="font-semibold">AI Category: <Badge variant="outline" className="text-accent border-accent">{issue.category}</Badge></p>
                                   </div>
                                   <div className="mt-2 sm:mt-0">
                                        {contact ? (
                                             <Button size="sm" asChild>
                                                <a href={`tel:${contact.phone}`}>
                                                    <Phone className="mr-2 h-4 w-4" /> Call {contact.name}
                                                </a>
                                             </Button>
                                        ) : (
                                            <Button size="sm" asChild>
                                                <Link href={`https://www.thumbtack.com/s/${issue.contactType.toLowerCase().replace(' ', '-')}/near-me/`} target="_blank">
                                                    <ExternalLink className="mr-2 h-4 w-4" /> Find on Thumbtack
                                                </Link>
                                            </Button>
                                        )}
                                   </div>
                                </AlertDescription>
                            </Alert>
                        )
                    })}
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Wrench /> Service Contacts</CardTitle>
                    <CardDescription>Your list of trusted service professionals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full mb-4" variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Add New Service Contact</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddContact}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact-name">Contact Name</Label>
                                        <Input id="contact-name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="e.g., Joe's Plumbing" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact-type">Service Type</Label>
                                        <Select value={newContact.type} onValueChange={value => setNewContact({...newContact, type: value})} required>
                                            <SelectTrigger id="contact-type">
                                                <SelectValue placeholder="Select service type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Plumber">Plumber</SelectItem>
                                                <SelectItem value="Electrician">Electrician</SelectItem>
                                                <SelectItem value="Pest Control">Pest Control</SelectItem>
                                                <SelectItem value="HVAC">HVAC</SelectItem>
                                                <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact-phone">Phone Number</Label>
                                        <Input id="contact-phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="e.g., 555-123-4567" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Contact</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <div className="space-y-2">
                        {contacts.length > 0 ? contacts.map(c => (
                             <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-semibold">{c.name}</p>
                                    <p className="text-sm text-muted-foreground">{c.type}</p>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                   <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                                       <Phone className="h-4 w-4" />
                                   </a>
                                </Button>
                            </div>
                        )) : (
                            <p className="text-sm text-center text-muted-foreground p-4">No contacts added yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Task Recommendation</CardTitle>
                    <CardDescription>Let AI suggest the optimal tasks for your team members based on their skills and current needs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AIRecommendationForm />
                </CardContent>
            </Card>
        </div>
    );
}
