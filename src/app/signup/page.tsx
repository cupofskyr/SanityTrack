
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
         <Button asChild variant="ghost" className="mb-4 -ml-4">
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
            <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
            <CardDescription className="pt-2">
              Let's get you set up so you can start managing sanitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                  <Label>I am a...</Label>
                   <RadioGroup defaultValue="owner" className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="owner" id="r-owner" />
                        <Label htmlFor="r-owner" className="font-normal">Business Owner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inspector" id="r-inspector" />
                        <Label htmlFor="r-inspector" className="font-normal">Health Inspector</Label>
                    </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground pt-1">
                        Employees and managers are invited by their business owners.
                    </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              
              <Button type="submit" className="w-full">
                Create Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By creating an account, you agree to our Terms of Service.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
