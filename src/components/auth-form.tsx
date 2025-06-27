"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.45 0 3.99 1.01 4.9 1.94l2.6-2.58C18.94 2.34 16.21 1 12.48 1 5.88 1 1 5.98 1 12.6s4.88 11.6 11.48 11.6c6.26 0 10.74-4.39 10.74-10.92 0-.75-.08-1.48-.22-2.18h-10.5z"/></svg>
);

export default function AuthForm() {
    const { loading, signInWithGoogle, signUpWithEmailAndPassword } = useAuth();
    
    // State for Sign In
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');

    // State for Sign Up
    const [signUpFullName, setSignUpFullName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpRole, setSignUpRole] = useState<'Business Owner' | 'Health Official'>('Business Owner');
    
    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        await signUpWithEmailAndPassword(signUpEmail, signUpPassword, signUpFullName, signUpRole);
    };

    const handleEmailSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Email/Password sign in is a placeholder for this demo. Please use Google Sign-In or the quick access role buttons.");
    };
    
    return (
        <Card>
            <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>
                <CardContent className="pt-6">
                    <TabsContent value="signin" className="m-0">
                        <div className="space-y-4">
                            <Button variant="outline" className="w-full" onClick={() => signInWithGoogle('Business Owner')} disabled={loading}>
                              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}
                              {loading ? 'Signing in...' : 'Continue with Google'}
                            </Button>
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                            </div>
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div className="space-y-2"><Label htmlFor="signin-email">Email</Label><Input id="signin-email" type="email" placeholder="you@example.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required /></div>
                                <div className="space-y-2"><Label htmlFor="signin-password">Password</Label><Input id="signin-password" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required /></div>
                                <Button type="submit" className="w-full" disabled={loading}>Sign In</Button>
                            </form>
                        </div>
                    </TabsContent>
                    <TabsContent value="signup" className="m-0">
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label>I am a...</Label>
                                <RadioGroup value={signUpRole} onValueChange={(value) => setSignUpRole(value as any)} className="flex gap-4 pt-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Business Owner" id="r-owner" /><Label htmlFor="r-owner" className="font-normal">Business Owner</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Health Official" id="r-inspector" /><Label htmlFor="r-inspector" className="font-normal">Health Official</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2"><Label htmlFor="signup-name">Full Name</Label><Input id="signup-name" value={signUpFullName} onChange={e => setSignUpFullName(e.target.value)} placeholder="John Doe" required /></div>
                            <div className="space-y-2"><Label htmlFor="signup-email">Email Address</Label><Input id="signup-email" type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} placeholder="you@example.com" required /></div>
                            <div className="space-y-2"><Label htmlFor="signup-password">Password</Label><Input id="signup-password" type="password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required /></div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Start Your Free Trial
                            </Button>
                        </form>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}
