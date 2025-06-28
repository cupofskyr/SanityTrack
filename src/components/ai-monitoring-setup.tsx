
"use client";

import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, PlusCircle, Trash2, Video, Sparkles, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { analyzeCameraImageAction } from '@/app/actions';
import type { CameraAnalysisOutput } from '@/ai/flows/cameraAnalysisFlow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Textarea } from './ui/textarea';

type VirtualCamera = {
  id: number;
  name: string;
  location: string;
  streamUrl: string;
  videoUrl: string; // Blob URL for the placeholder video
};

type AnalysisResult = {
    cameraId: number;
    output: CameraAnalysisOutput;
};

export default function AIMonitoringSetup() {
    const { toast } = useToast();
    const [cameras, setCameras] = useState<VirtualCamera[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state for new camera
    const [newCameraName, setNewCameraName] = useState('');
    const [newCameraLocation, setNewCameraLocation] = useState('');
    const [newStreamUrl, setNewStreamUrl] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // AI Analysis state
    const [analysisPrompts, setAnalysisPrompts] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const handleAddCamera = (e: FormEvent) => {
        e.preventDefault();
        if (!newCameraName || !newCameraLocation || !newStreamUrl || !videoFile) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all fields and select a video file.' });
            return;
        }

        const newCamera: VirtualCamera = {
            id: Date.now(),
            name: newCameraName,
            location: newCameraLocation,
            streamUrl: newStreamUrl,
            videoUrl: URL.createObjectURL(videoFile),
        };

        setCameras(prev => [...prev, newCamera]);
        toast({ title: 'Camera Added', description: `Successfully added the ${newCameraName} camera.` });
        
        // Reset form and close dialog
        setNewCameraName('');
        setNewCameraLocation('');
        setNewStreamUrl('');
        setVideoFile(null);
        setIsDialogOpen(false);
    };
    
    const handleDeleteCamera = (id: number) => {
        // Revoke the blob URL to prevent memory leaks
        const cameraToDelete = cameras.find(c => c.id === id);
        if (cameraToDelete) {
            URL.revokeObjectURL(cameraToDelete.videoUrl);
        }
        setCameras(prev => prev.filter(c => c.id !== id));
        toast({ variant: 'secondary', title: 'Camera Removed' });
    };

    const handleAnalyzeVideo = async (camera: VirtualCamera) => {
        const analysisPrompt = analysisPrompts[camera.id];
        if (!analysisPrompt) {
            toast({ variant: 'destructive', title: 'Missing Prompt', description: 'Please enter an analysis prompt.' });
            return;
        }
        
        setIsLoading(camera.id);
        setAnalysisResult(null);

        try {
            // **SIMULATION NOTE**: We use a representative static image for analysis
            // because transmitting and processing video in real-time is beyond
            // the scope of this prototype environment. This simulates analyzing a keyframe.
            const representativeImageUrl = 'https://storage.googleapis.com/gen-ai-recipes/person-in-restaurant.jpg';

            const result = await analyzeCameraImageAction({
                imageUrl: representativeImageUrl,
                analysisPrompt,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || 'AI analysis returned no data.');
            }
            
            setAnalysisResult({ cameraId: camera.id, output: result.data });
            toast({ title: 'AI Analysis Complete', description: `Report for ${camera.name} is ready.` });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsLoading(null);
        }
    };


    return (
        <Card className="lg:col-span-3" id="ai-monitoring">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><Video /> AI Monitoring Setup</CardTitle>
                    <CardDescription>Configure the daily tasks for your AI camera assistant. Tell it what to look for, and it will report back its findings.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Camera</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline">Add New Camera Feed</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCamera} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cam-name">Camera Name</Label>
                                <Input id="cam-name" value={newCameraName} onChange={e => setNewCameraName(e.target.value)} placeholder="e.g., Front Counter Cam" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cam-location">Location</Label>
                                <Input id="cam-location" value={newCameraLocation} onChange={e => setNewCameraLocation(e.target.value)} placeholder="e.g., Main Dining Room" required />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="cam-stream">Live Stream URL</Label>
                                <Input id="cam-stream" value={newStreamUrl} onChange={e => setNewStreamUrl(e.target.value)} placeholder="e.g., rtsp://..." required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cam-video">Placeholder Video File</Label>
                                <Input id="cam-video" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} required />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Camera</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Video Analysis Simulation</AlertTitle>
                    <AlertDescription>
                        For this prototype, AI analysis is performed on a representative static image, not the full video file. This simulates analyzing a keyframe from a live feed to generate insights.
                    </AlertDescription>
                </Alert>
                {cameras.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        <Camera className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold">No cameras added yet.</p>
                        <p>Click "Add Camera" to get started.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {cameras.map(camera => (
                            <Card key={camera.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        <span>{camera.name}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteCamera(camera.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>{camera.location}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="aspect-video w-full rounded-md overflow-hidden border bg-black">
                                        <video src={camera.videoUrl} loop autoPlay muted playsInline className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <LinkIcon className="h-3 w-3" />
                                        <span className="truncate">{camera.streamUrl}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`prompt-${camera.id}`} className="font-semibold">Tell the AI what to analyze:</Label>
                                        <Textarea
                                            id={`prompt-${camera.id}`}
                                            value={analysisPrompts[camera.id] || ''}
                                            onChange={e => setAnalysisPrompts({...analysisPrompts, [camera.id]: e.target.value})}
                                            placeholder="Be specific. For example: 'Count how many customers are in line.' or 'Alert me if a spill is not cleaned within 5 minutes.'"
                                            rows={3}
                                        />
                                    </div>
                                     {analysisResult && analysisResult.cameraId === camera.id && (
                                        <Alert>
                                            <AlertTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{analysisResult.output.reportTitle}</AlertTitle>
                                            <AlertDescription>
                                                <ul className="list-disc list-inside mt-2">
                                                    {analysisResult.output.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => handleAnalyzeVideo(camera)} disabled={isLoading === camera.id}>
                                        {isLoading === camera.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Run Daily Analysis
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
