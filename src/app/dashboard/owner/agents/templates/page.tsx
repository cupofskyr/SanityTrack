
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Package, Users, Smile, FileCode } from "lucide-react";
import Link from "next/link";

const templates = [
    { 
        icon: ShieldCheck, 
        name: "Compliance Monitor", 
        description: "Monitors temperature logs and critical task completions to ensure health code compliance and prevent violations." 
    },
    { 
        icon: Package, 
        name: "Inventory Alert Agent", 
        description: "Tracks key inventory items, alerts on low stock, and can be configured to predict future needs based on sales data." 
    },
    { 
        icon: Users, 
        name: "Staffing & Punctuality Agent", 
        description: "Analyzes clock-in/out data to flag punctuality issues and predict potential overtime situations before they occur." 
    },
    { 
        icon: Smile, 
        name: "Customer Experience Sentinel", 
        description: "Uses camera feeds to detect long queues or wait times, allowing you to proactively address service bottlenecks." 
    },
];

export default function AgentTemplatesPage() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><FileCode /> Agent Templates</CardTitle>
                    <CardDescription>Start with a pre-built template to quickly deploy common operational agents. You can customize them after creation.</CardDescription>
                </CardHeader>
             </Card>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <Card key={template.name}>
                        <CardHeader>
                             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                                <template.icon className="h-6 w-6" />
                             </div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild>
                                <Link href="/dashboard/owner/agents/new">Use this Template</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
        </div>
    );
}
