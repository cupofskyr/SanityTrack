
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, ThumbsUp, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { analyzeChatMessageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type FlowMessage = {
    user: string;
    avatar: string;
    message: string;
    isShoutout?: boolean;
    target?: string;
    isAiResponse?: boolean;
};

export default function TodaysFlow() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<FlowMessage[]>([
        { user: "Casey Lee", avatar: "CL", message: "Hey team, let's focus on table turn times today during the lunch rush!", isShoutout: false },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isShoutout, setIsShoutout] = useState(false);
    const [shoutoutTarget, setShoutoutTarget] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const employeeName = "John Doe"; // In a real app, get from auth context
        
        const userMessage: FlowMessage = {
            user: employeeName,
            avatar: "JD",
            message: newMessage,
            isShoutout,
            target: shoutoutTarget
        };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage("");
        setIsShoutout(false);
        setShoutoutTarget("");
        setIsThinking(true);

        try {
            const result = await analyzeChatMessageAction({ message: userMessage.message, employeeName });

            if (result.error || !result.data) {
                throw new Error(result.error || 'Failed to analyze message.');
            }

            if (result.data.actionTaken) {
                const aiResponseMessage: FlowMessage = {
                    user: "Leifur AI",
                    avatar: "AI",
                    message: result.data.summary,
                    isAiResponse: true,
                };
                setMessages(prev => [...prev, aiResponseMessage]);
            }
            // If no action was taken, we don't post a message to keep the chat clean.
            // A toast could be used here if feedback is desired for every message.

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: error.message
            });
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> Today's Flow</CardTitle>
                <CardDescription>A daily micro-thread for shift notes and shoutouts. The AI will monitor this chat for urgent requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 w-full pr-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <Avatar className="h-8 w-8">
                                    {msg.isAiResponse ? (
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Sparkles className="h-5 w-5"/>
                                        </div>
                                    ) : (
                                        <>
                                            <AvatarImage src={`https://placehold.co/40x40.png?text=${msg.avatar}`} data-ai-hint="user avatar" />
                                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{msg.user}</p>
                                    <p className="text-muted-foreground">{msg.isShoutout ? (
                                        <span className="text-yellow-600 font-medium flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" /> gave a shoutout to {msg.target}: "{msg.message}"</span>
                                    ) : msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                         {isThinking && (
                            <div className="flex items-start gap-2 text-sm">
                                <Avatar className="h-8 w-8">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Sparkles className="h-5 w-5"/>
                                    </div>
                                </Avatar>
                                <div className="flex items-center gap-2 text-muted-foreground italic">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>analyzing...</span>
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="mt-4 space-y-2">
                    {isShoutout && (
                        <Input
                            placeholder="Who are you shouting out?"
                            value={shoutoutTarget}
                            onChange={e => setShoutoutTarget(e.target.value)}
                            className="h-8 text-xs"
                            required
                        />
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder={isShoutout ? "Reason for shoutout..." : "Add to the flow..."}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon" variant="ghost" disabled={isThinking}><Send className="h-5 w-5"/></Button>
                    </div>
                    <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsShoutout(!isShoutout)}>
                        {isShoutout ? "Cancel Shoutout" : "Give a Shoutout"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
