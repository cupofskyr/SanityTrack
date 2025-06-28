
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Palette, Save } from "lucide-react";
import { getBrandGuidelinesAction, saveBrandGuidelinesAction } from '@/app/actions';
import { BrandGuidelinesDataSchema, type BrandGuidelinesData } from '@/ai/schemas/brand-guidelines-schemas';

export default function MarketingSetupPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BrandGuidelinesData>({
        resolver: zodResolver(BrandGuidelinesDataSchema),
        defaultValues: {
            brandName: '',
            primaryColor: '#3F51B5', // Default from theme
            brandVoice: 'Friendly, delicious, welcoming',
            forbiddenWords: 'cheap, nasty, gross'
        },
    });

    useEffect(() => {
        if (user) {
            getBrandGuidelinesAction(user.uid).then(result => {
                if (result.data) {
                    form.reset(result.data);
                } else if (result.error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not load existing brand guidelines.' });
                }
            });
        }
    }, [user, form, toast]);

    const onSubmit = async (data: BrandGuidelinesData) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not authenticated' });
            return;
        }

        setIsSubmitting(true);
        const result = await saveBrandGuidelinesAction({ data, userId: user.uid });
        setIsSubmitting(false);

        if (result.success) {
            toast({ title: 'Success!', description: 'Your Marketing AI has learned your brand voice.' });
            router.push('/dashboard/owner');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Marketing AI Setup</CardTitle>
                <CardDescription>Teach your AI the personality of your restaurant. These rules will ensure every generated promotion is perfectly on-brand.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Your Restaurant's Identity</h3>
                            <FormField
                                control={form.control}
                                name="brandName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Restaurant/Brand Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., SanityTrack Eats" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Brand Voice</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="brandVoice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Describe Your Vibe (Keywords)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Family-friendly, energetic, modern" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="forbiddenWords"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Words to Avoid (comma-separated)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., cheap, deal" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Visual Identity</h3>
                            <FormField
                                control={form.control}
                                name="primaryColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Brand Color</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Palette className="h-5 w-5 text-muted-foreground" />
                                                <Input type="color" {...field} className="w-12 h-10 p-1"/>
                                                <Input type="text" {...field} className="w-32"/>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Brand Identity
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
