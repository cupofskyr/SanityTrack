
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { submitFeedbackAction } from '@/app/actions';
import { Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const feedbackSchema = z.object({
    category: z.string().min(1, 'Please select a category.'),
    feedback: z.string().min(10, 'Please provide at least 10 characters of feedback.'),
    isAnonymous: z.boolean(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            category: '',
            feedback: '',
            isAnonymous: false,
        },
    });

    const onSubmit = async (data: FeedbackFormValues) => {
        setIsSubmitting(true);
        const result = await submitFeedbackAction(data);
        setIsSubmitting(false);

        if (result.success) {
            toast({
                title: 'Feedback Received!',
                description: 'Thank you for helping us improve.',
            });
            router.back(); // Go back to the previous page
        } else {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: result.error,
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MessageSquare /> Submit Feedback
                </CardTitle>
                <CardDescription>
                    Have a suggestion, found a bug, or want to give praise? Let us know! Your feedback is valuable.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a feedback category..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                                            <SelectItem value="bug">🐛 Bug Report</SelectItem>
                                            <SelectItem value="praise">🎉 Praise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="feedback"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Feedback</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please be as detailed as possible..."
                                            rows={6}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="isAnonymous"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Submit Anonymously</FormLabel>
                                        <FormDescription>
                                            If checked, your name ({user?.displayName || 'N/A'}) will not be attached to this feedback.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
