
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

type Scenario = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  correctAllergens: string[];
  correctAction: string;
  options: {
    allergens: string[];
    actions: string[];
  };
};

const scenarios: Scenario[] = [
  {
    id: 1,
    name: "Burger Problem",
    description: "We ran out of buns, so we've subbed the filling between two bagels.",
    imageUrl: "https://placehold.co/600x400.png",
    correctAllergens: ["Gluten"],
    correctAction: "throw away",
    options: {
      allergens: ["Gluten", "Dairy", "Nuts", "Shellfish", "Soy", "Eggs"],
      actions: ["serve as is", "throw away"],
    },
  },
  {
    id: 2,
    name: "Salad Cross-Contamination",
    description: "A customer ordered a salad with no nuts, but the tongs used to add chicken were just used on a salad with walnuts.",
    imageUrl: "https://placehold.co/600x400.png",
    correctAllergens: ["Nuts"],
    correctAction: "throw away",
    options: {
      allergens: ["Gluten", "Dairy", "Nuts", "Fish", "Soy", "Eggs"],
      actions: ["serve as is", "throw away"],
    },
  },
  {
    id: 3,
    name: "Fries Contamination",
    description: "The fries are cooked in the same fryer as the breaded fish sticks.",
    imageUrl: "https://placehold.co/600x400.png",
    correctAllergens: ["Gluten", "Fish"],
    correctAction: "throw away",
    options: {
      allergens: ["Gluten", "Dairy", "Nuts", "Fish", "Soy", "Eggs"],
      actions: ["serve as is", "throw away"],
    },
  },
];


export default function MenuGame() {
  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [showFeedback, setShowFeedback] = useState(false);

  // Shuffle scenarios on initial load
  useEffect(() => {
    setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5));
  }, []);

  const currentScenario = useMemo(() => shuffledScenarios[currentIndex], [shuffledScenarios, currentIndex]);

  const handleAllergenToggle = (allergen: string) => {
    if (showFeedback) return;
    setSelectedAllergens(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };
  
  const handleActionSelect = (action: string) => {
    if (showFeedback) return;
    setSelectedAction(action);
  };
  
  const checkAnswer = () => {
    if (!selectedAction) return;

    const isAllergenCorrect = 
        selectedAllergens.length === currentScenario.correctAllergens.length &&
        selectedAllergens.every(a => currentScenario.correctAllergens.includes(a));
    
    const isActionCorrect = selectedAction === currentScenario.correctAction;

    if (isAllergenCorrect && isActionCorrect) {
      setScore(s => s + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('incorrect');
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setAnswerState('unanswered');
    setSelectedAllergens([]);
    setSelectedAction(null);

    if (currentIndex < shuffledScenarios.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setShowFeedback(false);
    setAnswerState('unanswered');
    setSelectedAllergens([]);
    setSelectedAction(null);
  };
  
  if (shuffledScenarios.length === 0) {
    return <p className="text-center text-muted-foreground">Loading training game...</p>
  }

  if (showResults) {
    const accuracy = Math.round((score / shuffledScenarios.length) * 100);
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h2 className="text-2xl font-bold font-headline mb-2">Training Complete!</h2>
        <p className="text-lg">Your score: {score} out of {shuffledScenarios.length}</p>
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

  const getButtonVariant = (allergen: string) => {
    if (!showFeedback) {
        return selectedAllergens.includes(allergen) ? 'default' : 'outline';
    }
    // Feedback state
    const isCorrect = currentScenario.correctAllergens.includes(allergen);
    const isSelected = selectedAllergens.includes(allergen);

    if(isCorrect) return 'default';
    if(!isCorrect && isSelected) return 'destructive';
    return 'outline';
  }
  
  const getActionVariant = (action: string) => {
      if (!showFeedback) {
          return selectedAction === action ? 'default' : 'outline';
      }
      // Feedback state
      const isCorrect = action === currentScenario.correctAction;
      const isSelected = action === selectedAction;
      
      if(isCorrect) return 'default';
      if(!isCorrect && isSelected) return 'destructive';
      return 'outline';
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full">
        <Progress value={(currentIndex / shuffledScenarios.length) * 100} className="h-2" />
        <p className="text-sm text-muted-foreground text-center mt-2">Item {currentIndex + 1} of {shuffledScenarios.length}</p>
      </div>
      
      <Card className="w-full max-w-lg p-4">
        <CardContent className="p-0 flex flex-col items-center gap-4">
            <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={currentScenario.imageUrl} layout="fill" objectFit="cover" alt={currentScenario.name} data-ai-hint="food preparation"/>
            </div>
            <p className="text-center font-semibold">{currentScenario.description}</p>
            
            <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-center">What are the potential allergens?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {currentScenario.options.allergens.map(allergen => (
                        <Button 
                            key={allergen} 
                            variant={getButtonVariant(allergen)}
                            size="sm"
                            className={cn("transition-all", showFeedback && !currentScenario.correctAllergens.includes(allergen) && !selectedAllergens.includes(allergen) && "opacity-50" )}
                            onClick={() => handleAllergenToggle(allergen)}
                        >
                            {allergen}
                        </Button>
                    ))}
                </div>
            </div>

             <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-center">What should you do?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                   {currentScenario.options.actions.map(action => (
                        <Button 
                            key={action}
                            variant={getActionVariant(action)}
                            className={cn("capitalize transition-all", showFeedback && action !== currentScenario.correctAction && action !== selectedAction && "opacity-50")}
                            onClick={() => handleActionSelect(action)}
                        >
                            {action}
                        </Button>
                    ))}
                </div>
            </div>
            
            {showFeedback && (
                <Alert variant={answerState === 'correct' ? 'default' : 'destructive'} className="w-full">
                    <AlertTitle>{answerState === 'correct' ? 'Correct!' : 'Not Quite!'}</AlertTitle>
                    <AlertDescription>
                        {answerState === 'correct' ? 'Great job identifying the issue!' : 'Review the highlighted answers to see what you missed.'}
                    </AlertDescription>
                </Alert>
            )}

        </CardContent>
      </Card>
      
      <div className="flex w-full max-w-lg justify-center">
        {!showFeedback ? (
            <Button className="w-40 bg-blue-600 hover:bg-blue-700" onClick={checkAnswer} disabled={!selectedAction}>
                I Knew It
            </Button>
        ) : (
            <Button className="w-40" onClick={handleNext}>
                Next Question
            </Button>
        )}
      </div>

    </div>
  );
}
