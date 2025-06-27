
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Employee' | 'Health Department';
  status: 'Active' | 'Pending';
  avatar: string;
};

const initialTeamMembers: TeamMember[] = [
  { id: 1, name: 'Alex Ray', email: 'alex.ray@example.com', role: 'Owner', status: 'Active', avatar: 'https://placehold.co/100x100/3F51B5/FFFFFF.png' },
  { id: 2, name: 'Casey Lee', email: 'casey.lee@example.com', role: 'Manager', status: 'Active', avatar: 'https://placehold.co/100x100/FF5722/FFFFFF.png' },
  { id: 3, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', status: 'Active', avatar: 'https://placehold.co/100x100/4CAF50/FFFFFF.png' },
  { id: 4, name: 'Inspector Gadget', email: 'inspector.gadget@health.gov', role: 'Health Department', status: 'Active', avatar: 'https://placehold.co/100x100/2196F3/FFFFFF.png' },
  { id: 5, name: 'jane.smith@example.com', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Employee', status: 'Pending', avatar: 'https://placehold.co/100x100/9E9E9E/FFFFFF.png' },
];

export default function TeamPage() {
    const { toast } = useToast();
    const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Employee' as TeamMember['role'] });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.email) {
            toast({ variant: 'destructive', title: 'Missing information', description: 'Please provide a name and email.' });
            return;
        }
        const newTeamMember: TeamMember = {
            id: Date.now(),
            ...newMember,
            status: 'Pending',
            avatar: `https://placehold.co/100x100.png?text=${newMember.name.charAt(0)}`
        };
        setTeam([...team, newTeamMember]);
        toast({ title: 'Invite Sent!', description: `An invitation has been sent to ${newMember.email}.` });
        setIsInviteDialogOpen(false);
        setNewMember({ name: '', email: '', role: 'Employee' });
    };

    const openDeleteDialog = (member: TeamMember) => {
        setMemberToDelete(member);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!memberToDelete) return;
        setTeam(team.filter(m => m.id !== memberToDelete.id));
        toast({ title: 'Member Removed', description: `${memberToDelete.name} has been removed from the team.` });
        setIsDeleteDialogOpen(false);
        setMemberToDelete(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            Team & Permissions
                        </CardTitle>
                        <CardDescription>Manage your organization's users and their roles.</CardDescription>
                    </div>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Invite New Member
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {team.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} data-ai-hint="user avatar"/>
                                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                                                <DropdownMenuItem disabled={member.status === 'Pending'}>Resend Invite</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(member)}>
                                                    Remove Member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New Team Member</DialogTitle>
                        <DialogDescription>
                            They will receive an email to join your SanityTrack workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                             <Select value={newMember.role} onValueChange={val => setNewMember({...newMember, role: val as TeamMember['role']})}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Employee">Employee</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Owner">Owner</SelectItem>
                                    <SelectItem value="Health Department">Health Department</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                             <Button type="button" variant="secondary" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Send Invite</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <span className="font-semibold">{memberToDelete?.name}</span> from your workspace. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Remove Member</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
