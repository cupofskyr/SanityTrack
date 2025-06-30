
"use client";

import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Sparkles, Users, Code, Shield } from 'lucide-react';
import Link from 'next/link';
import AuthForm from '@/components/auth-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';


const Feature = ({ icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {React.createElement(icon, { className: 'h-6 w-6' })}
        </div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-muted-foreground">{children}</p>
        </div>
    </div>
);

export default function AppFrontDoorPage() {
  return (
    <main className="flex min-h-screen w-full items-center bg-gradient-to-br from-background to-muted/50">
      <div className="grid w-full grid-cols-1 md:grid-cols-2 container mx-auto gap-8">
        
        {/* Left Column: Value Proposition */}
        <div className="hidden flex-col justify-center p-4 lg:p-10 md:flex">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
               <Logo className="h-10 w-10 text-primary" />
               <h1 className="text-3xl font-bold font-headline">Leifur AI</h1>
            </div>
            <h2 className="text-4xl font-bold font-headline tracking-tight text-primary lg:text-5xl">
              The AI-Powered OS for Your Work Place.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Automate tasks, prevent waste, and manage your team with a single, intelligent platform.
            </p>
            <div className="mt-10 space-y-8">
              <Feature icon={ShieldCheck} title="Automated Compliance">
                AI-verified tasks and a perfect audit trail.
              </Feature>
              <Feature icon={Sparkles} title="Intelligent Operations">
                AI-powered scheduling and predictive inventory.
              </Feature>
              <Feature icon={Users} title="Engaged Teams">
                Gamified training and proactive culture insights.
              </Feature>
            </div>
          </div>
        </div>

        {/* Right Column: Action Panel */}
        <div className="flex flex-col items-center justify-center py-12 md:py-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center md:hidden">
                <Logo className="h-12 w-12 text-primary mx-auto mb-2" />
                <h1 className="text-3xl font-bold font-headline">Leifur AI</h1>
            </div>
            
            <AuthForm />

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Demo Access</AlertTitle>
                <AlertDescription>
                    Use the buttons below for quick access to pre-configured demo dashboards.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" variant="outline"><Link href="/dashboard/owner">Owner</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/dashboard/manager">Manager</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/dashboard/employee">Employee</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/dashboard/health-department">Inspector</Link></Button>
            </div>
             <div className="grid grid-cols-1 gap-2">
                 <Button asChild size="sm" variant="secondary"><Link href="/admin"><Shield className="mr-2"/>Admin Panel</Link></Button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
