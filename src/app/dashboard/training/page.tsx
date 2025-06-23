
"use client";

import MenuGame from '@/components/menu-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, ShieldQuestion } from 'lucide-react';

export default function TrainingPage() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BookOpen/> Menu Training Game</CardTitle>
                    <CardDescription>Test your knowledge of our menu items, ingredients, and allergens. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <MenuGame />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col bg-muted/50">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-muted-foreground"><Calculator /> Recipe & Counting Quiz</CardTitle>
                        <CardDescription>How many strawberries go in a Cloudy Morning bowl? Test your recipe knowledge here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-6">
                       <Button variant="secondary" disabled>Coming Soon</Button>
                    </CardContent>
                </Card>

                 <Card className="flex flex-col bg-muted/50">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-muted-foreground"><ShieldQuestion /> Basic Knowledge & Rules</CardTitle>
                        <CardDescription>Review company policies, safety procedures, and service standards.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center p-6">
                        <Button variant="secondary" disabled>Coming Soon</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
