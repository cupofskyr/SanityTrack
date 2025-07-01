
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface PasswordProtectProps {
    onSuccess: () => void;
}

export default function PasswordProtect({ onSuccess }: PasswordProtectProps) {
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
        
        if (password === correctPassword) {
            onSuccess();
        } else {
            toast({
                variant: 'destructive',
                title: 'Incorrect Password',
                description: 'Please try again.',
            });
        }
    };
    
    return (
        <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-3xl text-primary">Protected Demo</CardTitle>
                <CardDescription className="pt-2">
                    This application is currently access-restricted. Please enter the password to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="password">Password</Label>
                        <div className="flex items-center gap-2">
                             <KeyRound className="h-5 w-5 text-muted-foreground" />
                             <Input
                                id="password"
                                type="password"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        Unlock Demo
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
