
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function AiAgentChat({ agentName }: { agentName: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hello! I am the ${agentName}. How can I assist you today? You can ask for my current status, a summary of recent alerts, or run a diagnostic.` }
    ]);
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        
        // Simulate AI response
        const aiResponse: Message = { role: 'assistant', content: `As the ${agentName}, I have processed your request regarding "${input}". Currently, all systems under my watch are operating within normal parameters.` };
        
        setMessages(prev => [...prev, userMessage, aiResponse]);
        setInput('');
    };

    return (
        <Card className="flex flex-col h-[60vh]">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">Chat with {agentName}</CardTitle>
                <CardDescription>Interact with your AI agent for diagnostics, reports, or commands.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef as any}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                                        <AvatarFallback><Bot size={16} /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("p-3 rounded-lg max-w-[80%]", message.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><User size={16} /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t mt-4">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your command..." />
                    <Button type="submit"><Send className="h-4 w-4" /></Button>
                </form>
            </CardContent>
        </Card>
    );
}
