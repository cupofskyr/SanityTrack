
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, ThumbsUp, MessageSquare, AlertTriangle, Sparkles, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const feedEvents = [
    { type: 'task_completion', user: 'Sam Wilson', detail: 'Completed "Deep clean freezer unit"', time: new Date(Date.now() - 2 * 60 * 1000) },
    { type: 'shoutout', user: 'Jane Smith', target: 'John Doe', detail: 'for helping with the lunch rush!', time: new Date(Date.now() - 10 * 60 * 1000) },
    { type: 'agent_alert', detail: 'AI detected a potential spill near the drink station.', time: new Date(Date.now() - 25 * 60 * 1000) },
    { type: 'new_leader', user: 'Sam Wilson', detail: 'took the #1 spot on the Speed Run leaderboard!', time: new Date(Date.now() - 60 * 60 * 1000) },
    { type: 'flow_comment', user: 'Casey Lee (Manager)', detail: 'Remember to upsell the new seasonal shake today!', time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

const eventIcons = {
    task_completion: <CheckCircle className="h-4 w-4 text-green-500" />,
    shoutout: <ThumbsUp className="h-4 w-4 text-yellow-500" />,
    agent_alert: <AlertTriangle className="h-4 w-4 text-red-500" />,
    new_leader: <Trophy className="h-4 w-4 text-amber-500" />,
    flow_comment: <MessageSquare className="h-4 w-4 text-blue-500" />,
};

export default function LiveTeamFeed() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="text-primary" /> Live Team Feed
                </CardTitle>
                <CardDescription>Real-time updates from your team and the AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {feedEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {eventIcons[event.type as keyof typeof eventIcons]}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">
                                {event.type === 'shoutout' && <><b>{event.user}</b> gave a shoutout to <b>{event.target}</b> {event.detail}</>}
                                {event.type === 'task_completion' && <><b>{event.user}</b> {event.detail}</>}
                                {event.type === 'agent_alert' && <><b className="text-destructive">Sentinel AI:</b> {event.detail}</>}
                                {event.type === 'new_leader' && <><b>{event.user}</b> {event.detail}</>}
                                {event.type === 'flow_comment' && <><b>{event.user}:</b> "{event.detail}"</>}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(event.time, { addSuffix: true })}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
