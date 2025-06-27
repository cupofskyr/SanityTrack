
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Bot, Sparkles, Send, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryKnowledgeBaseAction } from '@/app/actions';

type QueryResult = {
    answer: string;
    source: string;
};

export default function CompanyBrainPage() {
    const { toast } = useToast();
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<QueryResult | null>(null);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const response = await queryKnowledgeBaseAction({ question });
            if (response.error || !response.data) {
                throw new Error(response.error || 'Failed to get an answer from the AI.');
            }
            setResult(response.data);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuestion(suggestion);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary" /> Ask the Company Brain</CardTitle>
                    <CardDescription>
                        Get instant, accurate answers to your operational questions. The AI uses your uploaded company documents as its source of truth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAskQuestion} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ai-question">Your Question</Label>
                            <Textarea
                                id="ai-question"
                                placeholder="e.g., What is the recipe for the Valkyrie Victory Bowl?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Ask Question
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {(isLoading || result) ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Answer</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Searching documents and generating answer...</span>
                            </div>
                        ) : result && (
                            <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>AI Assistant</AlertTitle>
                                <AlertDescription>
                                    <p className="mb-4">{result.answer}</p>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t">
                                        <FileText className="h-3 w-3" />
                                        <span>Source: {result.source}</span>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Suggested Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("How do I make the Valkyrie Victory Bowl?")}>How do I make the Valkyrie Victory Bowl?</Button>
                        <br />
                        <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick("What is the first step of the closing checklist?")}>What is the first step of the closing checklist?</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
