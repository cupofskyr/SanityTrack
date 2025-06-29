
"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Paintbrush, UploadCloud, Save } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function BrandingPage() {
    const { toast } = useToast();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [colors, setColors] = useState({
        primary: '#3F51B5',
        accent: '#FF5722',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setColors(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        // In a real app, this would update a theme context or CSS variables.
        // For this demo, we just show a toast.
        toast({
            title: 'Branding Updated!',
            description: 'Your new logo and color scheme have been saved.'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Paintbrush /> Branding & Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of your Leifur.AI workspace to match your brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Company Logo</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted">
                            {logoUrl ? <Image src={logoUrl} alt="Company Logo" width={96} height={96} className="object-contain" /> : <Logo className="h-12 w-12 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                             <Label htmlFor="logo-upload">Upload your logo (PNG, JPG, SVG)</Label>
                            <div className="flex gap-2 mt-2">
                                <Input ref={fileInputRef} id="logo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="font-semibold text-lg">Color Scheme</h3>
                     <div className="grid sm:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="primary-color"
                                    name="primary"
                                    value={colors.primary}
                                    onChange={handleColorChange}
                                    className="flex-1"
                                />
                                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: colors.primary }} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="accent-color">Accent Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="accent-color"
                                    name="accent"
                                    value={colors.accent}
                                    onChange={handleColorChange}
                                    className="flex-1"
                                />
                                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: colors.accent }} />
                            </div>
                        </div>
                     </div>
                </div>

            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveChanges}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
