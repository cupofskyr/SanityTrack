import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ClipboardCheck, UserCog, HeartPulse } from 'lucide-react';
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
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">Select your role to continue</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/guest/report">
                  <User />
                  Login as Guest
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/employee">
                  <ClipboardCheck />
                  Login as Employee
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/manager">
                  <UserCog />
                  Login as Manager
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/dashboard/health-department">
                  <HeartPulse />
                  Login as Health Dept.
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
