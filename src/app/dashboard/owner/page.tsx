
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { analyzeCameraImageAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type CameraReport = {
  reportTitle: string;
  observations: string[];
  data: Record<string, any>;
};

export default function OwnerDashboard() {
  const { toast } = useToast();
  const camera = {
    id: 'cam-01',
    location: 'Front Counter',
    imageUrl: 'https://storage.googleapis.com/gen-ai-recipes/person-in-restaurant.jpg',
  };

  const [analysisPrompt, setAnalysisPrompt] = useState('How many customers are in line, and what is the estimated wait time? Are any staff members idle?');
  const [report, setReport] = useState<CameraReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeCamera = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    const result = await analyzeCameraImageAction({
      imageUrl: camera.imageUrl,
      analysisPrompt,
    });

    if (result.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    } else if (result.data) {
      setReport(result.data);
      toast({
        title: 'Analysis Complete',
        description: 'The AI has finished analyzing the camera snapshot.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-headline text-3xl font-bold">Owner's Command Center</h1>
        <p className="text-muted-foreground">AI-Powered Operational Insights</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Camera Analysis</CardTitle>
          <CardDescription>
            Analyze a snapshot from a camera feed using a custom prompt. This feature uses Gemini 1.5 to provide detailed insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Location:</strong> {camera.location}</p>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
            <Image src={camera.imageUrl} alt="Camera Feed Snapshot" layout="fill" objectFit="cover" data-ai-hint="security camera" />
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="analysis-prompt">What do you want to know?</Label>
            <Textarea
              id="analysis-prompt"
              rows={3}
              value={analysisPrompt}
              onChange={(e) => setAnalysisPrompt(e.target.value)}
              placeholder="e.g., Count customers. Note handwashing events. Estimate wait times."
            />
          </div>
          
          <Button onClick={handleAnalyzeCamera} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Feed
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {report && (
            <div className="space-y-4 pt-4">
              <h4 className="font-headline text-xl">{report.reportTitle}</h4>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {report.observations.map((obs, index) => <li key={index}>{obs}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader>
                  <CardTitle className="text-lg">Extracted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(report.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
