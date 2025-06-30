
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link as LinkIcon, Bot, CheckCircle, XCircle, KeyRound, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Integration = {
    id: 'toast' | 'quickbooks';
    name: string;
    description: string;
    logoUrl: string;
    connected: boolean;
};

const initialIntegrations: Integration[] = [
    {
        id: 'toast',
        name: 'Toast POS',
        description: 'Sync your sales, menu, and inventory data in real-time.',
        logoUrl: 'https://placehold.co/80x80.png',
        connected: false,
    },
    {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        description: 'Automate your expense tracking and accounting workflows.',
        logoUrl: 'https://placehold.co/80x80.png',
        connected: false,
    },
];

const toastInstructions = `1. Log in to your **Toast Web Dashboard**.
2. Navigate to **Integrations > API Access** from the left-hand menu.
3. If you haven't already, click **+ Add a New Integration** and search for "Leifur.AI".
4. Once added, find "Leifur.AI" in your list of integrations and click **View Details**.
5. Your **API Key** will be displayed. Copy this key. It will be a long string of letters and numbers.
6. Paste the API Key into the field below and click Save.`;


export default function IntegrationsPage() {
    const { toast } = useToast();
    const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
    const [apiKey, setApiKey] = useState('');

    const handleConnect = (id: 'toast' | 'quickbooks') => {
        if (!apiKey) {
            toast({ variant: 'destructive', title: 'API Key Required' });
            return;
        }
        setIntegrations(integrations.map(int => int.id === id ? { ...int, connected: true } : int));
        setApiKey('');
        toast({ title: 'Connection Successful!', description: `${integrations.find(i=>i.id===id)?.name} is now connected.` });
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <LinkIcon /> API Integrations
                    </CardTitle>
                    <CardDescription>
                        Connect your third-party services like POS and accounting software to unlock powerful automations and insights.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {integrations.map((integration) => (
                        <Card key={integration.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Image src={integration.logoUrl} alt={`${integration.name} logo`} className="h-10 w-10 rounded-md" width={40} height={40} data-ai-hint="company logo" />
                                    <div>
                                        <CardTitle>{integration.name}</CardTitle>
                                        <div className={cn("flex items-center gap-1.5 text-sm font-semibold", integration.connected ? 'text-green-600' : 'text-muted-foreground')}>
                                            {integration.connected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                            {integration.connected ? 'Connected' : 'Not Connected'}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant={integration.connected ? "secondary" : "default"} disabled={integration.connected}>
                                            {integration.connected ? 'Manage Connection' : 'Connect'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="font-headline">Connect to {integration.name}</DialogTitle>
                                            <DialogDescription>
                                                Follow the AI-assisted steps below to find and enter your API key.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid md:grid-cols-2 gap-6 py-4">
                                            <div className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="api-key" className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> API Key</Label>
                                                    <Input
                                                        id="api-key"
                                                        type="password"
                                                        placeholder="Paste your API key here"
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                    />
                                                </div>
                                                <Button onClick={() => handleConnect(integration.id)} className="w-full">
                                                    Save & Connect
                                                </Button>
                                            </div>
                                            <Alert>
                                                <Sparkles className="h-4 w-4" />
                                                <AlertTitle className="font-semibold flex items-center gap-2">AI Assistant</AlertTitle>
                                                <AlertDescription>
                                                    <p className="mb-2">Here's how to find your API key in {integration.name}:</p>
                                                    <div className="text-xs space-y-2 whitespace-pre-wrap font-mono bg-muted p-3 rounded-md">
                                                        {integration.id === 'toast' ? toastInstructions : 'QuickBooks instructions would go here.'}
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
