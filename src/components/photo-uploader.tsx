"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, X } from 'lucide-react';

export default function PhotoUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        id="photo-upload"
      />
      
      {!preview ? (
        <label htmlFor="photo-upload" className="w-full">
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
            <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
          </div>
        </label>
      ) : (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image src={preview} alt="Image preview" layout="fill" objectFit="cover" />
          <div className="absolute top-2 right-2 flex items-center bg-black/50 p-1 rounded-md text-white text-xs">
            <span>{fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-6 w-6 text-white hover:bg-white/20 hover:text-white"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
