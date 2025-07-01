
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gift, Apple, QrCode } from "lucide-react";
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/icons";

// In a real app, this data would be fetched from a DB managed by the owner.
const perks = [
  { id: 1, name: 'Gym Membership Reimbursement', description: 'Up to $50 reimbursed monthly.' },
  { id: 2, name: 'Financial Wellness Seminar', description: 'Quarterly seminar with a financial advisor.' },
  { id: 3, name: 'Commuter Benefits', description: 'Pre-tax benefits for public transportation.' },
  { id: 4, name: '25% off at The Grind Coffee House', description: 'Local partner discount.' },
  { id: 5, name: 'Free Coffee Fridays', description: 'In-store perk.' },
];

const GooglePayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.15 4.16a2.6 2.6 0 1 0-3.3 0" />
        <path d="M12 12h.01" />
        <path d="M17.65 17.65a2.6 2.6 0 1 0 0-3.3" />
        <path d="M13.85 4.16a2.6 2.6 0 1 1 3.3 0" />
        <path d="M6.35 17.65a2.6 2.6 0 1 1 0 3.3" />
        <path d="M12 18.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" />
        <path d="M10.15 20.84a2.6 2.6 0 1 1-3.3 0" />
        <path d="M6.35 6.35a2.6 2.6 0 1 1 0-3.3" />
        <path d="M13.85 20.84a2.6 2.6 0 1 0 3.3 0" />
        <path d="M17.65 6.35a2.6 2.6 0 1 0 0 3.3" />
    </svg>
);


export default function PerksDisplayPage() {
    const { toast } = useToast();
    const { user } = useAuth();

    const handleAddToWallet = (wallet: 'Apple' | 'Google') => {
        toast({
            title: `Add to ${wallet} Wallet`,
            description: "This is a simulation. In a real app, this would generate and download a wallet pass.",
        });
    };

    return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    Your Perks & Benefits
                </CardTitle>
                <CardDescription>
                    Here are the current perks available to you as a valued team member.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {perks.map(perk => (
                        <li key={perk.id} className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                                <Gift className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold">{perk.name}</p>
                                <p className="text-sm text-muted-foreground">{perk.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
                <Logo className="h-8 w-8 text-white/90" />
                <CardTitle className="font-headline text-2xl">Membership Card</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/90 rounded-lg p-2 flex justify-center items-center">
              <QrCode className="h-24 w-24 text-black" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{user?.displayName || "Employee Name"}</p>
              <p className="text-xs opacity-80 font-mono">ID: EMP-{user?.uid.slice(0, 8).toUpperCase() || '12345678'}</p>
            </div>
            <div className="text-center bg-black/20 p-3 rounded-lg">
                <p className="text-xs opacity-80 uppercase tracking-wider">Credit Balance</p>
                <p className="text-2xl font-bold">$25.00</p>
            </div>
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Mobile Wallet</CardTitle>
                <CardDescription>Add your digital card to your phone for easy access.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12" onClick={() => handleAddToWallet('Apple')}>
                    <Apple className="mr-2" /> Apple Wallet
                </Button>
                <Button variant="outline" className="h-12" onClick={() => handleAddToWallet('Google')}>
                    <GooglePayIcon /> Google Pay
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
