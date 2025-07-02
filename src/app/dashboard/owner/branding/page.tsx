
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Palette, UploadCloud, Save, Loader2, RefreshCw } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useDropzone } from 'react-dropzone';
import { SketchPicker, ColorResult } from 'react-color';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const storage = getStorage(app);
const db = getFirestore(app);

const DEFAULT_COLOR = '#3F51B5';

export default function BrandingUploaderPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [ownerId, setOwnerId] = useState<string | null>(null);

    // Fetch branding data on mount
    useEffect(() => {
        if (user) {
            // In a real multi-tenant app, the ownerId might be different from user.uid.
            // For this demo, we assume the user is the owner.
            const currentOwnerId = user.uid;
            setOwnerId(currentOwnerId);
            const docRef = doc(db, 'branding', currentOwnerId);
            getDoc(docRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setLogoUrl(data.logoUrl || null);
                    setPrimaryColor(data.primaryColor || DEFAULT_COLOR);
                }
            }).catch(error => {
                console.error("Error fetching branding:", error);
                toast({ variant: 'destructive', title: "Error loading branding" });
            }).finally(() => setIsLoading(false));
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, toast]);

    const handleColorChange = (color: ColorResult) => {
        setPrimaryColor(color.hex);
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file || !ownerId) return;

        setIsUploading(true);
        const storageRef = ref(storage, `branding/${ownerId}/logo`);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setLogoUrl(downloadURL);
            toast({ title: 'Logo Uploaded Successfully' });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ variant: 'destructive', title: 'Upload Failed' });
        } finally {
            setIsUploading(false);
        }
    }, [ownerId, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.svg'] },
        multiple: false
    });

    const handleSaveChanges = async () => {
        if (!ownerId) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, 'branding', ownerId);
            await setDoc(docRef, { logoUrl, primaryColor }, { merge: true });
            toast({ title: 'Branding Saved!', description: 'Your new look is now live.' });
        } catch (error) {
            console.error("Save failed:", error);
            toast({ variant: 'destructive', title: 'Save Failed' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setPrimaryColor(DEFAULT_COLOR);
        setLogoUrl(null);
        toast({ title: 'Branding Reset', description: 'Changes have been reverted to default. Click save to confirm.'});
    };
    
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Palette /> App Branding & Customization
                </CardTitle>
                <CardDescription>Customize the look and feel of the employee membership card to match your brand identity.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* --- Uploader --- */}
                    <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 ${isDragActive ? 'border-primary' : ''}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                            </div>
                            <input {...getInputProps()} className="hidden" />
                            {isUploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        </div>
                    </div>
                    {/* --- Color Picker --- */}
                    <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <SketchPicker
                            color={primaryColor}
                            onChangeComplete={handleColorChange}
                            className="!shadow-none !bg-card !border !w-full"
                        />
                    </div>
                </div>
                {/* --- Live Preview --- */}
                <div className="space-y-2">
                    <Label>Live Preview</Label>
                     <div className="flex items-center justify-center p-4 bg-muted rounded-lg h-full">
                        <div
                            style={{ backgroundColor: primaryColor }}
                            className="w-full max-w-sm rounded-2xl shadow-lg p-6 text-white space-y-4 transform transition-all"
                        >
                            <div className="flex justify-between items-center">
                                {logoUrl ? <Image src={logoUrl} alt="Logo" width={48} height={48} className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 bg-white/20 rounded-md"/>}
                                <span className="font-semibold text-lg opacity-80">Perks Card</span>
                            </div>
                            <div className="text-center">
                                <p className="text-sm opacity-80">Balance</p>
                                <p className="text-4xl font-bold">$25.00</p>
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-semibold">{user?.displayName || 'Employee Name'}</p>
                                <p className="font-mono text-sm opacity-80">EMP-DEMO123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between">
                <Button onClick={handleSaveChanges} disabled={isSaving || isUploading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Save Changes
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    Reset to Default
                </Button>
            </CardFooter>
        </Card>
    );
}
