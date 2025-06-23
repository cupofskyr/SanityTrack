
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ClipboardCheck, UserCog, HeartPulse, Crown, Megaphone } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Logo className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">SanityTrack 2.0</CardTitle>
            <CardDescription className="pt-2">Proactive Sanitation & Hygiene Management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2 text-center">
                <p className="font-semibold">For Guests & Visitors</p>
                <p className="text-sm text-muted-foreground">Notice an issue? Help us improve by submitting a report.</p>
            </div>
            <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/guest/report">
                    <Megaphone className="mr-2 h-5 w-5" />
                    Submit a Public Report
                </Link>
            </Button>
            
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
                <p className="font-semibold">For Staff & Health Officials</p>
                <p className="text-sm text-muted-foreground">Select your role to access your dashboard.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/employee">
                  <ClipboardCheck />
                  Employee Login
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/manager">
                  <UserCog />
                  Manager Login
                </Link>
              </Button>
               <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/owner">
                  <Crown />
                  Owner Login
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/health-department">
                  <HeartPulse />
                  Health Dept. Login
                </Link>
              </Button>
            </div>
             <p className="text-xs text-muted-foreground text-center pt-2">
                Employees and Managers must be added to the system by their administrator to get login credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
