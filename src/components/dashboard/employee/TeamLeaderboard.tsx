
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

const leaderboardData = [
    { rank: 1, user: "Sam Wilson", xp: 450, avatar: "SW" },
    { rank: 2, user: "John Doe", xp: 380, avatar: "JD" },
    { rank: 3, user: "Jane Smith", xp: 320, avatar: "JS" },
];

export default function TeamLeaderboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy /> Team Leaderboard</CardTitle>
                <CardDescription>Weekly top performers based on XP.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">XP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map(player => (
                            <TableRow key={player.rank}>
                                <TableCell className="font-bold text-lg">{player.rank}</TableCell>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={`https://placehold.co/40x40.png?text=${player.avatar}`} data-ai-hint="user avatar" />
                                            <AvatarFallback>{player.avatar}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm">{player.user}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-primary">{player.xp}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
