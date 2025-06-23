
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { Megaphone } from 'lucide-react';

export default function LoginPage() {
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
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm font-semibold text-primary">Demo Access</p>
              <p className="text-xs text-muted-foreground">
                This is a prototype. Select a role below to access its dashboard. Real authentication is not implemented.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                  <Button asChild size="sm"><Link href="/dashboard/owner">Owner</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/manager">Manager</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/employee">Employee</Link></Button>
                  <Button asChild size="sm"><Link href="/dashboard/health-department">Inspector</Link></Button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>

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
