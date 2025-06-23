"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { summarizeReviews, type SummarizeReviewsOutput } from '@/ai/flows/fetch-reviews-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Rss } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function LiveReviews() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null); // 'google' | 'yelp' | null
    const [result, setResult] = useState<SummarizeReviewsOutput | null>(null);

    const handleFetchReviews = async (source: 'Google' | 'Yelp') => {
        setIsLoading(source.toLowerCase());
        setResult(null);
        try {
            const response = await summarizeReviews(`Fetch recent reviews from ${source}`);
            setResult(response);
            toast({
                title: `${source} Reviews Loaded`,
                description: "The AI has fetched and summarized the latest reviews.",
            })
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: `Failed to fetch reviews from ${source}.`,
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Rss /> Live Customer Feedback (Simulated)</CardTitle>
                <CardDescription>Use AI to fetch and summarize recent reviews from external sources like Google and Yelp.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <Button onClick={() => handleFetchReviews('Google')} disabled={!!isLoading}>
                        {isLoading === 'google' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Fetch Google Reviews
                    </Button>
                    <Button onClick={() => handleFetchReviews('Yelp')} disabled={!!isLoading} variant="outline">
                         {isLoading === 'yelp' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Fetch Yelp Reviews
                    </Button>
                </div>
                {result && (
                     <div>
                        <Alert className="mb-4">
                            <AlertTitle className="font-semibold">AI Summary</AlertTitle>
                            <AlertDescription>{result.summary}</AlertDescription>
                        </Alert>
                        <div className="space-y-4">
                            {result.reviews.map((review, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{review.author}</p>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < review.rating ? 'text-accent' : 'text-muted-foreground/30'}`}
                                                fill="currentColor"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">Source: {review.source}</p>
                                    <blockquote className="text-sm italic border-l-2 pl-3">"{review.comment}"</blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
