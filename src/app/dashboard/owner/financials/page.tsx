
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, FilePlus, Link as LinkIcon, Bot } from 'lucide-react';
import FinancialWizard from '@/components/financial-wizard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FinancialsPage() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // This would come from a database in a real app
    const isConnectedToQBO = false;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">QuickBooks Online Integration</CardTitle>
                    <CardDescription>Connect your QuickBooks account to automate expense reporting and streamline your financial operations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 rounded-lg border bg-muted p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {isConnectedToQBO ? 'Status: Connected' : 'Status: Not Connected'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isConnectedToQBO ? 'Your account is securely linked.' : 'Link your account to enable automated features.'}
                            </p>
                        </div>
                        <Button disabled={isConnectedToQBO}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect to QuickBooks
                        </Button>
                    </div>

                    <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Secure Connection</AlertTitle>
                        <AlertDescription>
                            We use the secure OAuth 2.0 protocol to connect to your QuickBooks account. Your login credentials are never shared with our application.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Expense Management</CardTitle>
                    <CardDescription>Submit new expenses for approval and view the status of recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isConnectedToQBO}>
                                <FilePlus className="mr-2 h-4 w-4" />
                                Submit New Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                             <DialogHeader>
                                <DialogTitle className="font-headline flex items-center gap-2">
                                    <Bot className="text-primary h-6 w-6"/>
                                    AI-Assisted Expense Submission
                                </DialogTitle>
                                <DialogDescription>
                                    Follow the steps to submit a new expense. The AI will help categorize it for you.
                                </DialogDescription>
                            </DialogHeader>
                            <FinancialWizard onClose={() => setIsWizardOpen(false)}/>
                        </DialogContent>
                    </Dialog>
                    {!isConnectedToQBO && <p className="text-xs text-muted-foreground mt-2">Please connect to QuickBooks to enable expense submission.</p>}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Transactions</CardTitle>
                    <CardDescription>A log of recently submitted expenses and their current approval status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        This area will show a table of recent expenses once the feature is fully implemented.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
