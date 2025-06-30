
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Gift, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export default function PerksManagementPage() {
  const { toast } = useToast();
  const [perks, setPerks] = useState<Perk[]>(initialPerks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPerk, setNewPerk] = useState({ name: '', description: '', category: 'Lifestyle' as Perk['category'] });

  const handleAddPerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerk.name || !newPerk.description) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please provide a name and description.' });
      return;
    }
    const newId = perks.length > 0 ? Math.max(...perks.map(p => p.id)) + 1 : 1;
    setPerks([...perks, { ...newPerk, id: newId }]);
    setIsDialogOpen(false);
    setNewPerk({ name: '', description: '', category: 'Lifestyle' });
    toast({ title: 'Perk Added!', description: `"${newPerk.name}" is now available to employees.` });
  };

  const handleRemovePerk = (perkId: number) => {
    setPerks(perks.filter(p => p.id !== perkId));
    toast({ variant: 'secondary', title: 'Perk Removed' });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline flex items-center gap-2"><Gift /> Employee Perks Management</CardTitle>
          <CardDescription>Define the perks and benefits available to your team.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Perk</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee Perk</DialogTitle>
              <DialogDescription>Describe the new perk you want to offer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPerk} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="perk-name">Perk Name</Label>
                <Input id="perk-name" value={newPerk.name} onChange={e => setNewPerk({...newPerk, name: e.target.value})} placeholder="e.g., Free Spotify Premium" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perk-description">Description</Label>
                <Textarea id="perk-description" value={newPerk.description} onChange={e => setNewPerk({...newPerk, description: e.target.value})} placeholder="e.g., How to claim and what's included." required />
              </div>
              <DialogFooter>
                <Button type="submit">Save Perk</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perk</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perks.length > 0 ? perks.map(perk => (
              <TableRow key={perk.id}>
                <TableCell className="font-medium">{perk.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{perk.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleRemovePerk(perk.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={3} className="text-center h-24">No perks defined yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
