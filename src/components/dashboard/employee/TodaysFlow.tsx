
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FlowMessage = {
    user: string;
    avatar: string;
    message: string;
    isShoutout?: boolean;
    target?: string;
};

export default function TodaysFlow() {
    const [messages, setMessages] = useState<FlowMessage[]>([
        { user: "Casey Lee", avatar: "CL", message: "Hey team, let's focus on table turn times today during the lunch rush!", isShoutout: false },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isShoutout, setIsShoutout] = useState(false);
    const [shoutoutTarget, setShoutoutTarget] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const message: FlowMessage = {
            user: "John Doe", // Current user
            avatar: "JD",
            message: newMessage,
            isShoutout,
            target: shoutoutTarget
        };
        setMessages([...messages, message]);
        setNewMessage("");
        setIsShoutout(false);
        setShoutoutTarget("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> Today's Flow</CardTitle>
                <CardDescription>A daily micro-thread for shift notes and shoutouts.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 w-full pr-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${msg.avatar}`} data-ai-hint="user avatar" />
                                    <AvatarFallback>{msg.avatar}</AvatarFallback>
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
                        <Button type="submit" size="icon" variant="ghost"><Send className="h-5 w-5"/></Button>
                    </div>
                    <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsShoutout(!isShoutout)}>
                        {isShoutout ? "Cancel Shoutout" : "Give a Shoutout"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
