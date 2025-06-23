import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/icons";
import PhotoUploader from "@/components/photo-uploader";
import { ArrowLeft } from "lucide-react";

export default function GuestReportPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Login
            </Link>
        </Button>
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Logo className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">Submit a Report</CardTitle>
            <CardDescription className="pt-2">
              Help us maintain our standards. If you see something, say something.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div className="space-y-2">
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="location">Location of Issue</Label>
                  <Input id="location" placeholder="e.g., Men's Restroom, Table 12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of Issue</Label>
                <Textarea id="description" placeholder="Please describe the issue in detail." required />
              </div>
              
              <div className="space-y-2">
                <Label>Photo Evidence</Label>
                <PhotoUploader />
              </div>

              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
