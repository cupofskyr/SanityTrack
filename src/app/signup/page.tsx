
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.45 0 3.99 1.01 4.9 1.94l2.6-2.58C18.94 2.34 16.21 1 12.48 1 5.88 1 1 5.98 1 12.6s4.88 11.6 11.48 11.6c6.26 0 10.74-4.39 10.74-10.92 0-.75-.08-1.48-.22-2.18h-10.5z"/></svg>
);

const FacebookIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Facebook</title><path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.41h3.128V8.91c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.29h-3.12V24h5.713c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/></svg>
);


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
            <div className="grid grid-cols-1 gap-2">
                <Button variant="outline"><GoogleIcon /> Continue with Google</Button>
                <Button variant="outline" className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white"><FacebookIcon/> Continue with Facebook</Button>
            </div>

             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or sign up with email
                    </span>
                </div>
            </div>

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
