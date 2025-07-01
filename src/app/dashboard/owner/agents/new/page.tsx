
"use client";

import AiAgentWizard from '@/components/ai-agent-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export default function CreateAgentPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Wand2 className="text-primary" />
                    Create New AI Agent
                </CardTitle>
                <CardDescription>
                    Follow this step-by-step guide to build and deploy a new autonomous agent to monitor your operations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AiAgentWizard />
            </CardContent>
        </Card>
    );
}
