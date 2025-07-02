
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SVGProps } from "react";

interface PasswordProtectProps {
    onSuccess: () => void;
}

const LeifurLogo = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        width="64" 
        height="64" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect width="64" height="64" rx="12" fill="currentColor"/>
        <path d="M24.532 43V21H30.644V37.456H39.5V43H24.532Z" fill="white"/>
    </svg>
);


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
                <div className="mx-auto mb-4">
                    <LeifurLogo className="h-16 w-16 text-primary" />
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
