
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { Megaphone, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.45 0 3.99 1.01 4.9 1.94l2.6-2.58C18.94 2.34 16.21 1 12.48 1 5.88 1 1 5.98 1 12.6s4.88 11.6 11.48 11.6c6.26 0 10.74-4.39 10.74-10.92 0-.75-.08-1.48-.22-2.18h-10.5z"/></svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  const { signInWithGoogle, signInWithFacebook, loading } = useAuth();

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
                <Button variant="outline" onClick={() => signInWithGoogle('Business Owner')} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Button>
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

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
            
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Demo Access</AlertTitle>
                <AlertDescription>
                    Use the buttons below for quick access to pre-configured demo dashboards.
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
                    For Guests
                    </span>
                </div>
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
