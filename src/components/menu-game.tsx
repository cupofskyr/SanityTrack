
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  imageUrl: string;
};

// In a real app, this would be fetched from a database.
const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Classic Burger', description: 'A juicy beef patty with lettuce, tomato, onion, and our secret sauce.', ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Onion', 'Bun', 'Secret Sauce'], allergens: ['Gluten', 'Dairy'], imageUrl: 'https://placehold.co/600x400.png' },
  { id: 2, name: 'Vegan Burger', description: 'A plant-based patty that tastes just like the real thing.', ingredients: ['Plant-Based Patty', 'Lettuce', 'Tomato', 'Onion', 'Vegan Bun', 'Vegan Sauce'], allergens: ['Gluten', 'Soy'], imageUrl: 'https://placehold.co/600x400.png' },
  { id: 3, name: 'Caesar Salad', description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing.', ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'], allergens: ['Gluten', 'Dairy', 'Fish'], imageUrl: 'https://placehold.co/600x400.png' },
  { id: 4, name: 'Margherita Pizza', description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.', ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'], allergens: ['Gluten', 'Dairy'], imageUrl: 'https://placehold.co/600x400.png' },
  { id: 5, name: 'Fish & Chips', description: 'Battered cod served with a side of french fries and tartar sauce.', ingredients: ['Cod', 'Flour', 'Potatoes', 'Tartar Sauce'], allergens: ['Gluten', 'Fish', 'Egg'], imageUrl: 'https://placehold.co/600x400.png' },
];

export default function MenuGame() {
  const [shuffledItems, setShuffledItems] = useState<MenuItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Shuffle items on initial load
    setShuffledItems([...initialMenuItems].sort(() => Math.random() - 0.5));
  }, []);

  const currentItem = useMemo(() => shuffledItems[currentIndex], [shuffledItems, currentIndex]);

  const handleNext = (knewIt: boolean) => {
    if (knewIt) {
      setScore(s => s + 1);
    }
    
    if (currentIndex < shuffledItems.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setShuffledItems([...initialMenuItems].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setIsFlipped(false);
    setShowResults(false);
  };
  
  if (shuffledItems.length === 0) {
    return <p className="text-center text-muted-foreground">Loading training game...</p>
  }

  if (showResults) {
    const accuracy = Math.round((score / shuffledItems.length) * 100);
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h2 className="text-2xl font-bold font-headline mb-2">Training Complete!</h2>
        <p className="text-lg">Your score: {score} out of {shuffledItems.length}</p>
        <p className="text-4xl font-bold text-primary my-4">{accuracy}%</p>
        <p className="text-muted-foreground mb-6">
            {accuracy > 80 ? "Excellent work! You know the menu inside and out." : "Good effort! A little more practice will make perfect."}
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
        <Progress value={(currentIndex / shuffledItems.length) * 100} className="h-2" />
        <p className="text-sm text-muted-foreground text-center mt-2">Item {currentIndex + 1} of {shuffledItems.length}</p>
      </div>

      <div className="w-full max-w-lg h-80 [perspective:1000px]">
        <div 
          className={`relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <Card className="absolute w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center p-4 cursor-pointer">
            <h2 className="text-3xl font-headline font-bold">{currentItem.name}</h2>
            <div className="relative w-48 h-32 my-4 rounded-md overflow-hidden">
                <Image src={currentItem.imageUrl} layout="fill" objectFit="cover" alt={currentItem.name} data-ai-hint="food meal"/>
            </div>
            <p className="text-muted-foreground">Click card to see details</p>
          </Card>
          
          {/* Back of card */}
          <Card className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-6 overflow-y-auto">
            <CardContent className="p-0">
                <h3 className="font-bold text-lg font-headline mb-2">{currentItem.name}</h3>
                <p className="text-sm mb-4">{currentItem.description}</p>
                <div className="text-left space-y-3">
                    <div>
                        <h4 className="font-semibold text-sm">Ingredients:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {currentItem.ingredients.map(ing => <Badge key={ing} variant="secondary">{ing}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm">Allergens:</h4>
                         <div className="flex flex-wrap gap-1 mt-1">
                            {currentItem.allergens.map(allergen => <Badge key={allergen} variant="destructive">{allergen}</Badge>)}
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex w-full max-w-lg justify-around">
        <Button variant="destructive" className="w-40" onClick={() => handleNext(false)}>
          <XCircle className="mr-2"/>
          I Didn't Know
        </Button>
        <Button className="w-40" onClick={() => handleNext(true)}>
          <CheckCircle className="mr-2"/>
          I Knew It
        </Button>
      </div>
      
       <Alert>
        <AlertTitle className="font-semibold">Leaderboard Coming Soon!</AlertTitle>
        <AlertDescription>
          Keep practicing! A leaderboard will be added soon to see how you rank against your teammates.
        </AlertDescription>
      </Alert>
    </div>
  );
}
