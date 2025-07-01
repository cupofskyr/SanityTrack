
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";

const onShift = [
    { name: "John Doe", avatar: "JD", status: 'on-shift' },
    { name: "Jane Smith", avatar: "JS", status: 'on-shift' },
    { name: "Sam Wilson", avatar: "SW", status: 'on-break' },
    { name: "Casey Lee", avatar: "CL", status: 'starting-soon' },
];

export default function WhosOnShift() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Who's On Shift</CardTitle>
                <CardDescription>Live presence for your location.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-3">
                        {onShift.map(member => (
                            <Tooltip key={member.name}>
                                <TooltipTrigger>
                                    <Avatar className="relative">
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${member.avatar}`} data-ai-hint="user avatar" />
                                        <AvatarFallback>{member.avatar}</AvatarFallback>
                                        {member.status === 'on-shift' && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                                        {member.status === 'on-break' && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-background" />}
                                        {member.status === 'starting-soon' && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background" />}
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{member.name}</p>
                                    <p className="text-xs capitalize text-muted-foreground">{member.status.replace('-', ' ')}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
