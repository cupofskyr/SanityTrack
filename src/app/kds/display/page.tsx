
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type KdsAlert = {
    itemName: string;
    score: number;
    feedback: string;
    deviations: string[];
    timestamp: string;
};

export default function KdsDisplayPage() {
    const [alertData, setAlertData] = useState<KdsAlert | null>(null);
    const [locationId, setLocationId] = useState<string | null>(null);
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const pairedLocation = localStorage.getItem('kds-paired-location-id');
        if (!pairedLocation) {
            router.replace('/kds/pair');
        } else {
            setLocationId(pairedLocation);
        }
    }, [router]);

    useEffect(() => {
        if (!locationId) return;

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `kds-alert-${locationId}` && event.newValue) {
                const newAlertData = JSON.parse(event.newValue);
                setAlertData(newAlertData);
                audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
            }
        };

        // Check for existing alert on load
        const existingAlert = localStorage.getItem(`kds-alert-${locationId}`);
        if(existingAlert) {
            setAlertData(JSON.parse(existingAlert));
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [locationId]);

    const handleAcknowledge = () => {
        if (!locationId) return;
        localStorage.removeItem(`kds-alert-${locationId}`);
        setAlertData(null);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    if (!locationId) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }
    
    return (
        <main className={cn(
            "flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500",
            alertData ? 'bg-red-800 animate-pulse-bg' : 'bg-gray-900'
        )}>
            {/* The alarm sound. In a real app, you'd host this file. Using a placeholder link. */}
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop />

            <div className="w-full max-w-4xl text-white">
                {!alertData ? (
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-24 w-24 text-green-400" />
                        <h1 className="mt-6 text-5xl font-bold font-headline">Systems Normal</h1>
                        <p className="mt-2 text-2xl text-gray-400">{locationId} Location</p>
                    </div>
                ) : (
                    <Card className="bg-red-900/80 border-red-500 shadow-2xl shadow-red-500/50">
                        <CardHeader className="text-center">
                            <AlertTriangle className="mx-auto h-24 w-24 text-yellow-300 animate-ping-slow" />
                             <CardTitle className="mt-6 text-6xl font-bold font-headline text-yellow-300">
                                QA SENTINEL ALERT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-3xl font-semibold">Low Quality Score Detected on "{alertData.itemName}"</p>
                            <p className="text-2xl text-yellow-200">Score: <span className="font-bold">{alertData.score}/10</span></p>
                            <p className="text-xl italic text-gray-300">"{alertData.feedback}"</p>
                            <Button onClick={handleAcknowledge} size="lg" className="h-16 text-2xl mt-8 bg-yellow-300 text-black hover:bg-yellow-400">
                                Acknowledge & Silence Alarm
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}

// Add this to your tailwind.config.ts to make the animations work
// keyframes: {
//     'pulse-bg': {
//         '0%, 100%': { backgroundColor: 'hsl(var(--destructive))' }, // using a variable for red
//         '50%': { backgroundColor: 'hsl(var(--destructive) / 0.8)' },
//     }
// },
// animation: {
//     'pulse-bg': 'pulse-bg 2s ease-in-out infinite',
// }
