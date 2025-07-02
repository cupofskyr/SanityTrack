
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, ArrowRight, Check, X, Package, CookingPot, Utensils, SprayCan } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

type GameItem = {
    id: number;
    name: string;
    station: 'Prep' | 'Cooking' | 'Serving' | 'Sanitation';
    icon: React.ElementType;
};

const allItems: GameItem[] = [
    { id: 1, name: "Raw Chicken Breast", station: 'Prep', icon: Package },
    { id: 2, name: "Sizzling Steak", station: 'Cooking', icon: CookingPot },
    { id: 3, name: "Plated Burger", station: 'Serving', icon: Utensils },
    { id: 4, name: "Sanitizer Bucket", station: 'Sanitation', icon: SprayCan },
    { id: 5, name: "Freshly Chopped Onions", station: 'Prep', icon: Package },
    { id: 6, name: "Hot Soup", station: 'Cooking', icon: CookingPot },
    { id: 7, name: "Garnished Salad", station: 'Serving', icon: Utensils },
    { id: 8, name: "Dirty Dishes", station: 'Sanitation', icon: SprayCan },
];

const stations = [
    { id: 'Prep', name: 'Prep Station', icon: Package },
    { id: 'Cooking', name: 'Cooking Line', icon: CookingPot },
    { id: 'Serving', name: 'Serving Window', icon: Utensils },
    { id: 'Sanitation', name: 'Sanitation Area', icon: SprayCan },
];

export default function SortItOutGame() {
    const [gameItems, setGameItems] = useState<GameItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; selected: string } | null>(null);

    useEffect(() => {
        // Shuffle items on initial load
        setGameItems([...allItems].sort(() => Math.random() - 0.5));
    }, []);

    const currentItem = useMemo(() => gameItems[currentIndex], [gameItems, currentIndex]);

    const handleAnswer = (selectedStation: GameItem['station']) => {
        if (feedback) return; // Don't allow answering again

        const isCorrect = selectedStation === currentItem.station;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setFeedback({ correct: isCorrect, selected: selectedStation });
    };

    const handleNext = () => {
        setFeedback(null);
        if (currentIndex < gameItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleRestart = () => {
        setGameItems([...allItems].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setScore(0);
        setShowResults(false);
        setFeedback(null);
    };
    
    if (gameItems.length === 0) {
        return <p className="text-center text-muted-foreground">Loading Game...</p>;
    }

    if (showResults) {
        const accuracy = Math.round((score / gameItems.length) * 100);
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
                <h2 className="text-2xl font-bold font-headline mb-2">Game Over!</h2>
                <p className="text-lg">Your score: {score} out of {gameItems.length}</p>
                <p className="text-4xl font-bold text-primary my-4">{accuracy}%</p>
                <p className="text-muted-foreground mb-6">
                    {accuracy > 80 ? "Great job! You know your stations well." : "Good try! Keep practicing to improve."}
                </p>
                <Button onClick={handleRestart}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="w-full">
                <Progress value={((currentIndex + 1) / gameItems.length) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground text-center mt-2">Item {currentIndex + 1} of {gameItems.length}</p>
            </div>
            
            <Card className="w-full max-w-md p-6 flex flex-col items-center justify-center min-h-[150px]">
                <currentItem.icon className="h-16 w-16 text-primary mb-4" />
                <p className="text-2xl font-semibold text-center">{currentItem.name}</p>
            </Card>

            <div className="w-full max-w-xl grid grid-cols-2 gap-4">
                {stations.map(station => (
                    <Button 
                        key={station.id}
                        variant={feedback?.selected === station.id ? (feedback.correct ? 'default' : 'destructive') : 'outline'}
                        className={cn("h-20 text-lg justify-start p-4", feedback && feedback.selected !== station.id && 'opacity-50')}
                        onClick={() => handleAnswer(station.id as GameItem['station'])}
                        disabled={!!feedback}
                    >
                        <station.icon className="mr-4 h-6 w-6" />
                        {station.name}
                        {feedback?.selected === station.id && (feedback.correct ? <Check className="ml-auto h-6 w-6" /> : <X className="ml-auto h-6 w-6" />)}
                    </Button>
                ))}
            </div>

            {feedback && (
                 <div className="w-full max-w-xl flex justify-center">
                    <Button onClick={handleNext}>
                        Next Item <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
