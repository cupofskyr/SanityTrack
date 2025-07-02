"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, DollarSign, Info, FileDown, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data for state minimum wages
const stateLaborLaws = {
    'Arizona': 14.35,
    'California': 16.00,
    'New York': 16.00,
    'Texas': 7.25,
};
type State = keyof typeof stateLaborLaws;

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Employee' | 'Health Department';
  roleTitle: string;
  status: 'Active' | 'Pending';
  avatar: string;
  hourlyRate: number;
};

const initialTeamMembers: TeamMember[] = [
  { id: 1, name: 'Alex Ray', email: 'alex.ray@example.com', role: 'Owner', roleTitle: 'Owner/Operator', status: 'Active', avatar: 'https://placehold.co/100x100/3F51B5/FFFFFF.png', hourlyRate: 35.00 },
  { id: 2, name: 'Casey Lee', email: 'casey.lee@example.com', role: 'Manager', roleTitle: 'General Manager', status: 'Active', avatar: 'https://placehold.co/100x100/FF5722/FFFFFF.png', hourlyRate: 25.00 },
  { id: 3, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', roleTitle: 'Line Cook', status: 'Active', avatar: 'https://placehold.co/100x100/4CAF50/FFFFFF.png', hourlyRate: 20.00 },
  { id: 4, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Employee', roleTitle: 'Server', status: 'Pending', avatar: 'https://placehold.co/100x100/9E9E9E/FFFFFF.png', hourlyRate: 18.00 },
];

export default function TeamPage() {
    const { toast } = useToast();
    const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
    const [editedRate, setEditedRate] = useState('');
    const [businessState, setBusinessState] = useState<State>('Arizona');
    
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleOpenEditDialog = (member: TeamMember) => {
        setMemberToEdit(member);
        setEditedRate(String(member.hourlyRate));
    };

    const handleSaveRate = () => {
        if (!memberToEdit) return;
        const newRate = parseFloat(editedRate);
        if (isNaN(newRate) || newRate < 0) {
            toast({ variant: 'destructive', title: 'Invalid Rate', description: 'Please enter a valid hourly rate.' });
            return;
        }

        setTeam(team.map(m => m.id === memberToEdit.id ? { ...m, hourlyRate: newRate } : m));
        toast({ title: 'Rate Updated', description: `${memberToEdit.name}'s hourly rate has been set to ${formatCurrency(newRate)}.` });
        setMemberToEdit(null);
    };
    
    const handleSetToMinWage = () => {
        if (!memberToEdit) return;
        const minWage = stateLaborLaws[businessState];
        setEditedRate(String(minWage));
    }
    
    const handleExportPayroll = () => {
        toast({
            title: "Payroll Exported (Simulated)",
            description: "A CSV file with the payroll data would be generated and downloaded here."
        });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2">
                        Staff & Payroll Overview
                    </CardTitle>
                    <CardDescription>Manage your team, their roles, and their hourly rates. This information is used for labor cost projections.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        <div className="grid gap-2">
                            <Label htmlFor="business-state">Business State</Label>
                            <Select value={businessState} onValueChange={(val) => setBusinessState(val as State)}>
                                <SelectTrigger id="business-state">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(stateLaborLaws).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground">State minimum wage is used as a baseline. Current: {formatCurrency(stateLaborLaws[businessState])}/hr</p>
                        </div>
                    </div>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Labor Law Simulation</AlertTitle>
                        <AlertDescription>
                          This is a simplified simulation. In a real-world application, this data would be integrated with a payroll provider or a service that tracks up-to-date labor laws.
                        </AlertDescription>
                    </Alert>
                 </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>An overview of all active and pending users in your organization.</CardDescription>
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
                                <TableHead>Role Title</TableHead>
                                <TableHead className="hidden sm:table-cell">Hourly Rate</TableHead>
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
                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{member.roleTitle}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {formatCurrency(member.hourlyRate)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(member)}>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Manage Salary
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Payroll Export</CardTitle>
                    <CardDescription>Export total hours and estimated costs for your accounting software or CPA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                         <Button onClick={handleExportPayroll}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Payroll Data (.csv)
                        </Button>
                         <Button variant="secondary" onClick={() => toast({title: "Email Sent (Simulated)"})}>
                            <Mail className="mr-2 h-4 w-4" />
                            Email to CPA
                        </Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-4">Integrates with shift planner totals and AI cost estimates.</p>
                </CardContent>
            </Card>

            <Dialog open={!!memberToEdit} onOpenChange={(isOpen) => !isOpen && setMemberToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Rate for {memberToEdit?.name}</DialogTitle>
                        <DialogDescription>
                            Set a custom hourly rate or use the state minimum wage.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                             <Label htmlFor="hourly-rate">Custom Hourly Rate ($)</Label>
                            <Input
                                id="hourly-rate"
                                type="number"
                                step="0.01"
                                value={editedRate}
                                onChange={e => setEditedRate(e.target.value)}
                                placeholder="e.g., 18.50"
                            />
                        </div>
                        <Button variant="secondary" onClick={handleSetToMinWage}>
                            Use {businessState} Minimum Wage ({formatCurrency(stateLaborLaws[businessState])})
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setMemberToEdit(null)}>Cancel</Button>
                        <Button type="button" onClick={handleSaveRate}>Save Rate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
