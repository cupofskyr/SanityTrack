
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Gift, Trash2, Loader2, DollarSign, Ban, ShieldCheck } from 'lucide-react';
import { getFirestore, collection, onSnapshot, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from '@/lib/firebase';
import { useAuth, AppUser } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const db = getFirestore(app);
const functions = getFunctions(app);

type Perk = {
  id: number;
  name: string;
  description: string;
  category: 'Health' | 'Financial' | 'Lifestyle';
};

const initialPerks: Perk[] = [
  { id: 1, name: 'Gym Membership Reimbursement', description: 'Up to $50 reimbursed monthly for gym memberships.', category: 'Health' },
  { id: 2, name: 'Financial Wellness Seminar', description: 'Quarterly seminar with a financial advisor.', category: 'Financial' },
  { id: 3, name: 'Commuter Benefits', description: 'Pre-tax benefits for public transportation.', category: 'Lifestyle' },
];

type EmployeeWithCard = {
    id: string;
    name: string;
    email: string;
    role: string;
    locationId: string;
    membershipCard: {
        creditBalance: number;
        status: 'active' | 'suspended' | 'revoked';
    }
}

export default function PerksManagementPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [perks, setPerks] = useState<Perk[]>(initialPerks);
    const [employees, setEmployees] = useState<EmployeeWithCard[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPerkDialogOpen, setIsPerkDialogOpen] = useState(false);
    const [newPerk, setNewPerk] = useState({ name: '', description: '', category: 'Lifestyle' as Perk['category'] });
    
    const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithCard | null>(null);
    const [balanceChange, setBalanceChange] = useState({ amount: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        let q;
        if (user.role === 'owner') {
            q = collection(db, "employees");
        } else if (user.role === 'manager' && user.locationId) {
            q = query(collection(db, "employees"), where("locationId", "==", user.locationId));
        } else {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeWithCard));
            setEmployees(emps);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching employees:", error);
            toast({ variant: 'destructive', title: 'Error loading team data.'});
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAddPerk = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a client-side only operation for the demo
        const newId = perks.length > 0 ? Math.max(...perks.map(p => p.id)) + 1 : 1;
        setPerks([...perks, { ...newPerk, id: newId }]);
        setIsPerkDialogOpen(false);
        setNewPerk({ name: '', description: '', category: 'Lifestyle' });
        toast({ title: 'Perk Added!', description: `"${newPerk.name}" is now available.` });
    };

    const handleRemovePerk = (perkId: number) => {
        setPerks(perks.filter(p => p.id !== perkId));
        toast({ variant: 'secondary', title: 'Perk Removed' });
    };

    const handleOpenBalanceDialog = (employee: EmployeeWithCard) => {
        setSelectedEmployee(employee);
        setBalanceChange({ amount: '', reason: '' });
        setIsBalanceDialogOpen(true);
    };

    const handleAdjustBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !balanceChange.amount || !balanceChange.reason) return;
        
        setIsSubmitting(true);
        try {
            const adjustBalanceFunc = httpsCallable(functions, 'adjustBalance');
            await adjustBalanceFunc({
                employeeId: selectedEmployee.id,
                amount: parseFloat(balanceChange.amount),
                reason: balanceChange.reason
            });
            toast({ title: "Balance Updated Successfully!" });
            setIsBalanceDialogOpen(false);
        } catch (error: any) {
            console.error("Error adjusting balance:", error);
            toast({ variant: 'destructive', title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeStatus = async (employeeId: string, newStatus: 'active' | 'suspended' | 'revoked') => {
        setIsSubmitting(true);
         try {
            const changeStatusFunc = httpsCallable(functions, 'changeCardStatus');
            await changeStatusFunc({ employeeId, newStatus });
            toast({ title: "Card Status Updated" });
        } catch (error: any) {
            console.error("Error changing status:", error);
            toast({ variant: 'destructive', title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><Gift /> Company Perks</CardTitle>
                        <CardDescription>Define the perks available to your team. Updates are pushed live.</CardDescription>
                    </div>
                    {user?.role === 'owner' && (
                        <Dialog open={isPerkDialogOpen} onOpenChange={setIsPerkDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Perk</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Employee Perk</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddPerk} className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="perk-name">Perk Name</Label>
                                        <Input id="perk-name" value={newPerk.name} onChange={e => setNewPerk({...newPerk, name: e.target.value})} placeholder="e.g., Monthly Health Stipend" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="perk-desc">Description</Label>
                                        <Input id="perk-desc" value={newPerk.description} onChange={e => setNewPerk({...newPerk, description: e.target.value})} placeholder="e.g., $100 towards health and wellness." required />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="perk-category">Category</Label>
                                        <Select value={newPerk.category} onValueChange={val => setNewPerk({...newPerk, category: val as Perk['category']})}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Health">Health</SelectItem>
                                                <SelectItem value="Financial">Financial</SelectItem>
                                                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={() => setIsPerkDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit">Add Perk</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Perk Name</TableHead>
                                <TableHead>Category</TableHead>
                                {user?.role === 'owner' && <TableHead className="text-right">Action</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {perks.map(perk => (
                                <TableRow key={perk.id}>
                                    <TableCell className="font-medium">{perk.name}</TableCell>
                                    <TableCell>{perk.category}</TableCell>
                                    {user?.role === 'owner' && (
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemovePerk(perk.id)} aria-label={`Delete perk ${perk.name}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><DollarSign /> Employee Balances & Card Status</CardTitle>
                    <CardDescription>Manage individual employee perk balances and card statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Card Status</TableHead><TableHead>Balance</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {employees.map(emp => (
                                    <TableRow key={emp.id}>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>{emp.membershipCard.status}</TableCell>
                                        <TableCell>${emp.membershipCard.creditBalance.toFixed(2)}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenBalanceDialog(emp)}>Adjust Balance</Button>
                                            {emp.membershipCard.status === 'active' 
                                              ? <Button variant="secondary" size="sm" onClick={() => handleChangeStatus(emp.id, 'suspended')} disabled={isSubmitting}><Ban className="mr-2"/>Suspend</Button>
                                              : <Button variant="secondary" size="sm" onClick={() => handleChangeStatus(emp.id, 'active')} disabled={isSubmitting}><ShieldCheck className="mr-2"/>Reactivate</Button>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Balance for {selectedEmployee?.name}</DialogTitle>
                        <DialogDescription>Add or subtract from their perks card balance. Provide a reason for the audit log.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdjustBalance}>
                        <div className="py-4 space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" step="0.01" value={balanceChange.amount} onChange={(e) => setBalanceChange(p => ({...p, amount: e.target.value}))} required placeholder="50.00 or -25.00"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Input id="reason" value={balanceChange.reason} onChange={(e) => setBalanceChange(p => ({...p, reason: e.target.value}))} required placeholder="e.g., Monthly performance bonus"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsBalanceDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Confirm Adjustment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
