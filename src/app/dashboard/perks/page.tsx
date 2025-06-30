
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift } from 'lucide-react';

const perks = [
  { id: 1, name: 'Gym Membership Reimbursement', description: 'Stay active on us! We reimburse up to $50 per month for your gym or fitness class memberships. Submit your receipts to your manager by the 5th of each month.' },
  { id: 2, name: 'Financial Wellness Seminar', description: 'Join our quarterly webinar with a certified financial advisor to help you plan for your future. The next session is on August 15th. Sign-up link will be shared via email.' },
  { id: 3, name: 'Commuter Benefits', description: 'Save money on your commute. You can set aside pre-tax dollars for public transportation costs. See your manager to enroll in the program.' },
  { id: 4, name: 'Free Spotify Premium', description: 'Enjoy ad-free music on us! We provide a free Spotify Premium subscription to all active employees. Contact HR to get your activation code.' },
];

export default function PerksDisplayPage() {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Company Perks & Benefits</h1>
            <p className="text-muted-foreground">Here are some of the great benefits available to you as a member of our team.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {perks.map(perk => (
                <Card key={perk.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary"><Gift className="h-5 w-5" />{perk.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{perk.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
