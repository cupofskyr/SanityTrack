
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PhotoUploader from '@/components/photo-uploader';
import { compareFoodQualityAction } from '@/app/actions';
import type { CompareFoodQualityOutput } from '@/ai/schemas/food-quality-schemas';

const goldenStandardItems = [
    {
        name: "Classic Burger",
        imageUrl: "https://storage.googleapis.com/gen-ai-recipes/golden-burger.jpg"
    },
    {
        name: "Caesar Salad",
        imageUrl: "https://storage.googleapis.com/gen-ai-recipes/golden-salad.jpg"
    }
];

export default function QualityControlPage() {
    const { toast } = useToast();
    const [selectedStandard, setSelectedStandard] = useState(goldenStandardItems[0]);
    const [auditPhotoUri, setAuditPhotoUri] = useState<string | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<CompareFoodQualityOutput | null>(null);

    const handleAudit = async () => {
        if (!auditPhotoUri) {
            toast({ variant: 'destructive', title: "Missing Photo", description: "Please upload a photo of the dish to audit." });
            return;
        }
        setIsAuditing(true);
        setAuditResult(null);

        try {
            const { data, error } = await compareFoodQualityAction({
                standardImageUri: selectedStandard.imageUrl,
                actualImageUri: auditPhotoUri,
                itemName: selectedStandard.name
            });

            if (error || !data) {
                throw new Error(error || "Failed to get AI audit result.");
            }
            setAuditResult(data);
            toast({ title: "AI Audit Complete", description: "The quality report is ready for review below." });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: "Audit Failed", description: error.message });
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">AI Quality Control Audit</CardTitle>
                    <CardDescription>
                        Compare a freshly prepared dish against its "golden standard" photo to ensure presentation consistency.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Golden Standard</h3>
                        <Select
                            value={selectedStandard.name}
                            onValueChange={(name) => {
                                setSelectedStandard(goldenStandardItems.find(item => item.name === name)!);
                                setAuditResult(null); // Clear previous results on change
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a menu item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {goldenStandardItems.map(item => (
                                    <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                            <Image src={selectedStandard.imageUrl} alt={`Golden standard for ${selectedStandard.name}`} layout="fill" objectFit="cover" data-ai-hint="food presentation" />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold">Dish to Audit</h3>
                        <PhotoUploader onPhotoDataChange={setAuditPhotoUri} />
                        <Button className="w-full" onClick={handleAudit} disabled={isAuditing || !auditPhotoUri}>
                            {isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Audit with AI
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {auditResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI Audit Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Quality Score</p>
                            <p className="text-4xl font-bold text-primary">{auditResult.score}/10</p>
                        </div>
                        <Alert variant={auditResult.score > 7 ? "default" : "destructive"}>
                            {auditResult.score > 7 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle>Chef's Feedback</AlertTitle>
                            <AlertDescription>{auditResult.feedback}</AlertDescription>
                        </Alert>
                         {auditResult.deviations.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Identified Deviations:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                                    {auditResult.deviations.map((dev, i) => <li key={i}>{dev}</li>)}
                                </ul>
                            </div>
                         )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
