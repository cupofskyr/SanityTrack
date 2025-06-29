
"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Bot, User, Mic, Send, Loader2, UploadCloud } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { continueOnboardingInterviewAction, masterOnboardingParserAction } from '@/app/actions';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

interface OnboardingInterviewProps {
    onOnboardingComplete: () => void;
}

export default function OnboardingInterview({ onOnboardingComplete }: OnboardingInterviewProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleInitialMessage = useCallback(() => {
        setMessages([{
            role: 'assistant',
            content: "Hi there! I'm your personal setup assistant. To get your dashboard configured perfectly, I just need to ask you a few quick questions. Ready to begin?"
        }]);
    }, []);

    useEffect(() => {
        handleInitialMessage();
    }, [handleInitialMessage]);
    
    useEffect(() => {
        // Scroll to bottom of chat
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const conversationHistory = [...messages, newUserMessage].map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
            
            const result = await continueOnboardingInterviewAction({ conversationHistory });

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.data) {
                const newAssistantMessage: Message = { role: 'assistant', content: result.data.response };
                setMessages(prev => [...prev, newAssistantMessage]);

                if(result.data.isComplete) {
                    handleFinalizeSetup(conversationHistory);
                }
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
            const errorMessage: Message = { role: 'assistant', content: "I'm sorry, I encountered an error. Could you please try rephrasing that?" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFinalizeSetup = async (conversationHistory: any[]) => {
        setIsFinalizing(true);
        const finalizationMessage: Message = { role: 'assistant', content: "This is fantastic information. I'm now building out your dashboard based on our conversation. This might take a moment..."};
        setMessages(prev => [...prev, finalizationMessage]);

        try {
            const fullTranscript = conversationHistory.map(m => `${m.role}: ${m.parts[0].text}`).join('\n');
            const result = await masterOnboardingParserAction({ conversationTranscript: fullTranscript });

            if (result.error) throw new Error(result.error);
            
            // In a real app, this data would be saved to Firestore here.
            // For the simulation, we'll just show a success message.
            const summaryMessage: Message = {
                role: 'assistant',
                content: `All set! I've processed our conversation. Redirecting you to your new dashboard now...`
            };
            setMessages(prev => [...prev, summaryMessage]);

            setTimeout(() => {
                onOnboardingComplete();
            }, 4000);

        } catch(error: any) {
             const errorMessage: Message = { role: 'assistant', content: "I'm sorry, I failed to build your dashboard. You can try again or use the manual setup." };
             setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsFinalizing(false);
        }
    };


    return (
        <div className="flex items-center justify-center p-4 md:p-8 bg-muted/20 min-h-screen">
            <Card className="w-full max-w-3xl h-[80vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2">
                        <Sparkles /> Leifur.AI AI Onboarding
                    </CardTitle>
                    <CardDescription>
                        Let's set up your business together. Just answer a few questions.
                    </CardDescription>
                </CardHeader>
                <CardContent ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && <div className="p-2 rounded-full bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></div>}
                            <div className={`rounded-lg px-4 py-3 max-w-[80%] ${msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                            {msg.role === 'user' && <div className="p-2 rounded-full bg-secondary text-secondary-foreground"><User className="h-6 w-6" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></div>
                            <div className="rounded-lg px-4 py-3 max-w-[80%] bg-muted flex items-center gap-2">
                               <Loader2 className="h-5 w-5 animate-spin" />
                               <p className="text-sm italic">Thinking...</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="shrink-0" title="Use Microphone (Simulated)">
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Textarea
                            placeholder="Type your answer here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            rows={1}
                            className="resize-none"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            disabled={isLoading || isFinalizing}
                        />
                        <Button type="submit" size="icon" className="shrink-0" disabled={isLoading || isFinalizing}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                         <Button variant="link" size="sm" onClick={onOnboardingComplete}>I'd rather do a manual setup</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
