
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link, Wifi } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function KdsPairingPage() {
    const [locationCode, setLocationCode] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    // In a real app, you'd fetch locations from a DB. We'll use a mock list.
    const validLocations = [
        { code: 'DT-1A2B', name: 'Downtown' },
        { code: 'UP-3C4D', name: 'Uptown' }
    ];

    const handlePairDevice = (e: React.FormEvent) => {
        e.preventDefault();
        const matchedLocation = validLocations.find(l => l.code.toUpperCase() === locationCode.toUpperCase());

        if (matchedLocation) {
            localStorage.setItem('kds-paired-location-id', matchedLocation.name);
            toast({
                title: 'Device Paired!',
                description: `This KDS is now linked to the ${matchedLocation.name} location.`,
            });
            router.push('/kds/display');
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'That location code was not found. Please try again.',
            });
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Wifi className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-3xl text-white">Pair KDS Device</CardTitle>
                        <CardDescription className="pt-2 text-gray-400">
                            Enter the unique location code from your Owner Dashboard to link this screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePairDevice} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="location-code" className="text-gray-300">Location Code</Label>
                                <Input 
                                    id="location-code"
                                    value={locationCode}
                                    onChange={e => setLocationCode(e.target.value)}
                                    placeholder="e.g., DT-1A2B"
                                    className="bg-gray-900 border-gray-600 text-white h-12 text-lg text-center tracking-widest uppercase"
                                    required
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full bg-primary h-12 text-lg">
                                <Link className="mr-2 h-5 w-5"/>
                                Link Device
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                 <p className="text-center text-xs text-gray-500 mt-4">
                    This screen is intended for a dedicated, always-on Kitchen Display System (e.g., an iPad).
                </p>
            </div>
        </main>
    );
}
