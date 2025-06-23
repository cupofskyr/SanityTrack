
"use client";

import { useState } from 'react';
import MenuGame from '@/components/menu-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, ShieldQuestion, Video, Upload, Trophy, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type VideoSubmission = {
    id: number;
    user: string;
    item: string;
    time: number;
    videoUrl: string;
};

export default function TrainingPage() {
    const { toast } = useToast();
    const [videos, setVideos] = useState<VideoSubmission[]>([]);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    
    const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [newTime, setNewTime] = useState('');


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setNewVideoFile(file);
        } else {
            setNewVideoFile(null);
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please select a valid video file.'
            })
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVideoFile || !newItemName || !newTime) {
            toast({ 
                variant: 'destructive', 
                title: 'Missing Information',
                description: 'Please provide a video, item name, and your time.'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const newVideo: VideoSubmission = {
                id: Date.now(),
                user: 'Demo User', // In a real app, this would come from the logged-in user's data
                item: newItemName,
                time: parseInt(newTime, 10),
                videoUrl: event.target?.result as string,
            };
            setVideos(prev => [newVideo, ...prev]);
            setIsUploadDialogOpen(false);
            
            // Reset form
            setNewVideoFile(null);
            setNewItemName('');
            setNewTime('');

            toast({ title: 'Video Uploaded!', description: 'Your speed run has been submitted to the challenge.' });
        };
        reader.readAsDataURL(newVideoFile);
    };


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

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Video/> Speed Run Challenge</CardTitle>
                    <CardDescription>Think you're the fastest? Upload a video of you making a menu item and compete for the top spot on the leaderboard! Each month the #1 ranking gets a 500$ bonus</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Your Speed Run
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Your Video</DialogTitle>
                                <DialogDescription>
                                    Select your video file, enter the menu item you made, and your time in seconds.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="video-file">Video File</Label>
                                        <Input id="video-file" type="file" accept="video/*" onChange={handleFileChange} required />
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="item-name">Menu Item Name</Label>
                                        <Input id="item-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., Classic Burger" required/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time">Time (in seconds)</Label>
                                        <Input id="time" type="number" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="e.g., 45" required/>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Submit Video</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <div className="mt-6 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Trophy className="text-accent" /> Leaderboard</h3>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Rank</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Menu Item</TableHead>
                                            <TableHead className="text-right">Time (s)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {videos.length > 0 ? (
                                            videos
                                                .sort((a, b) => a.time - b.time)
                                                .map((video, index) => (
                                                    <TableRow key={video.id}>
                                                        <TableCell className="font-bold">{index + 1}</TableCell>
                                                        <TableCell>{video.user}</TableCell>
                                                        <TableCell>{video.item}</TableCell>
                                                        <TableCell className="text-right font-mono">{video.time}</TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No submissions yet. Be the first!
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><PlayCircle /> View Submissions</h3>
                            {videos.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {videos.map(video => (
                                        <Card key={video.id} className="overflow-hidden">
                                            <div className="aspect-video bg-black">
                                                <video src={video.videoUrl} controls className="w-full h-full object-cover" />
                                            </div>
                                            <CardContent className="p-4">
                                                <p className="font-semibold">{video.item}</p>
                                                <div className="text-sm text-muted-foreground flex justify-between items-center">
                                                    <span>By: {video.user}</span>
                                                    <span className="font-bold text-base text-foreground">{video.time}s</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                    <Video className="mx-auto h-12 w-12" />
                                    <p className="mt-4 font-semibold">No speed runs submitted yet.</p>
                                    <p className="text-sm">Upload a video to get on the leaderboard.</p>
                                </div>
                            )}
                        </div>
                    </div>
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
