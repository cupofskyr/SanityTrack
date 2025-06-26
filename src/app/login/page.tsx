
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { Megaphone, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.45 0 3.99 1.01 4.9 1.94l2.6-2.58C18.94 2.34 16.21 1 12.48 1 5.88 1 1 5.98 1 12.6s4.88 11.6 11.48 11.6c6.26 0 10.74-4.39 10.74-10.92 0-.75-.08-1.48-.22-2.18h-10.5z"/></svg>
);

const FacebookIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Facebook</title><path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.41h3.128V8.91c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.29h-3.12V24h5.713c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      toast({
        title: "Sign-In Successful",
        description: `Welcome back, ${user.displayName}!`,
      });
      // For this demo, we'll just send everyone to the employee dashboard.
      // A real app would check the user's role here.
      router.push('/dashboard/employee');
    } else {
        toast({
            variant: "destructive",
            title: "Sign-In Failed",
            description: "There was a problem signing in with Google. Please try again.",
        })
    }
  };

  const handleFacebookSignIn = () => {
    toast({
        variant: "default",
        title: "Feature Not Implemented",
        description: "Facebook Sign-In requires developer setup and is currently a placeholder.",
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Logo className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">SanityTrack 2.0</CardTitle>
            <CardDescription className="pt-2">Proactive Sanitation & Hygiene Management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={handleGoogleSignIn}><GoogleIcon /> Continue with Google</Button>
                <Button variant="outline" className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white" onClick={handleFacebookSignIn}><FacebookIcon/> Continue with Facebook</Button>
            </div>
            
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Demo Access</AlertTitle>
                <AlertDescription>
                    Google Sign-in is now functional. You can also use the role buttons below for quick access to demo dashboards.
                </AlertDescription>
            </Alert>


            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm font-semibold text-primary">Quick Access Role Selection</p>
              
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                  <Button asChild size="sm"><Link href="/dashboard/owner">Owner</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/manager">Manager</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/employee">Employee</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/health-department">Inspector</Link></Button>
              </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>

            <div className="space-y-2 text-center">
                <p className="font-semibold">For Guests & Visitors</p>
                <p className="text-sm text-muted-foreground">Notice an issue? Help us improve by submitting a report.</p>
            </div>
            <Button asChild variant="outline" className="w-full">
                <Link href="/guest/report">
                    <Megaphone className="mr-2 h-5 w-5" />
                    Submit a Public Report
                </Link>
            </Button>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
