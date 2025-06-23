
"use client";

import MenuGame from '@/components/menu-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TrainingPage() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Menu Training Game</CardTitle>
                    <CardDescription>Test your knowledge of our menu items, ingredients, and allergens. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <MenuGame />
                </CardContent>
            </Card>
        </div>
    );
}
