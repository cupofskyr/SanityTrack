
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ThumbsUp, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { analyzeChatMessageAction } from '@/app/actions';

type FlowMessage = {
    user: string;
    avatar: string;
    message: string;
    isShoutout?: boolean;
    target?: string;
    isAiResponse?: boolean;
};

const CHAT_STORAGE_KEY = 'todays-flow-chat';
const initialMessage: FlowMessage = { user: "Casey Lee (Manager)", avatar: "CL", message: "Hey team, let's focus on table turn times today during the lunch rush!", isShoutout: false };

export default function TodaysFlow() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<FlowMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isShoutout, setIsShoutout] = useState(false);
    const [shoutoutTarget, setShoutoutTarget] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const loadMessages = () => {
            const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([initialMessage]);
            }
        };
        loadMessages();
    
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === CHAT_STORAGE_KEY && event.newValue) {
                setMessages(JSON.parse(event.newValue));
            }
        };
    
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateMessages = (newMessages: FlowMessage[]) => {
        setMessages(newMessages);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
        // Manually dispatch a storage event so other tabs using this component update
        window.dispatchEvent(new StorageEvent('storage', {
            key: CHAT_STORAGE_KEY,
            newValue: JSON.stringify(newMessages),
        }));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const employeeName = user.displayName || 'Demo User';
        const employeeInitials = (user.displayName || 'DU').split(' ').map(n=>n[0]).join('');
        
        const userMessage: FlowMessage = {
            user: employeeName,
            avatar: employeeInitials,
            message: newMessage,
            isShoutout,
            target: shoutoutTarget
        };
        
        const currentMessages = [...messages, userMessage];
        updateMessages(currentMessages);
        
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
                updateMessages([...currentMessages, aiResponseMessage]);
            }

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
        <>
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
        </>
    );
}
