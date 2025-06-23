
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function ClaimLocationContent() {
  const searchParams = useSearchParams();
  const locationName = searchParams.get('location');
  const { toast } = useToast();

  const handleClaimLocation = () => {
    toast({
      title: 'Location Added!',
      description: `"${locationName}" has been successfully added to your jurisdiction file.`,
    });
    // In a real app, this would trigger a database update.
  };

  if (!locationName) {
    return (
       <Card className="w-full max-w-2xl">
         <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
         </CardHeader>
         <CardContent>
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No location was specified. This link may be broken or expired.</AlertDescription>
            </Alert>
         </CardContent>
         <CardFooter>
            <Button asChild variant="outline">
                <Link href="/dashboard/health-department">Return to Dashboard</Link>
            </Button>
         </CardFooter>
       </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader className="text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="font-headline mt-4 text-2xl">Claim New Location</CardTitle>
        <CardDescription>
          You are about to add a new establishment to your inspection jurisdiction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">You are claiming:</p>
          <p className="text-lg font-semibold">{decodeURIComponent(locationName)}</p>
        </div>
         <Alert>
            <AlertTitle>Confirm Action</AlertTitle>
            <AlertDescription>
                By clicking the button below, this location will be permanently added to your file. You will be responsible for its compliance tracking.
            </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button asChild variant="outline">
            <Link href="/dashboard/health-department">Cancel</Link>
        </Button>
        <Button onClick={handleClaimLocation}>
          Confirm and Add to My Jurisdiction <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function ClaimLocationPage() {
    return (
        <div className="flex justify-center items-start pt-10">
            <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Loading...</div>}>
                <ClaimLocationContent />
            </Suspense>
        </div>
    )
}
