"use client";

import React, { useState, useRef, FormEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Camera {
  id: number;
  name: string;
  location: string;
  streamUrl: string;
  videoUrl: string;
}

export default function AIMonitoringSetup() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [newCameraName, setNewCameraName] = useState("");
  const [newCameraLocation, setNewCameraLocation] = useState("");
  const [newStreamUrl, setNewStreamUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast()
  const handleAddCamera = (e: FormEvent) => {
    e.preventDefault();

    if (!newCameraName || !newCameraLocation || !newStreamUrl || !videoFile) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields and select a video file.",
      });
      return;
    }

    const videoUrl = URL.createObjectURL(videoFile);

    const newCamera: Camera = {
      id: cameras.length > 0 ? cameras[cameras.length - 1].id + 1 : 1,
      name: newCameraName,
      location: newCameraLocation,
      streamUrl: newStreamUrl,
      videoUrl,
    };

    setCameras((prev) => [...prev, newCamera]);

    setNewCameraName("");
    setNewCameraLocation("");
    setNewStreamUrl("");
    setVideoFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast({ variant: "default", title: "Camera Added" });
  };

  const handleDeleteCamera = (id: number) => {
    // Revoke the blob URL to prevent memory leaks
    const cameraToDelete = cameras.find((c) => c.id === id);
    if (cameraToDelete) {
      URL.revokeObjectURL(cameraToDelete.videoUrl);
    }
    setCameras((prev) => prev.filter((c) => c.id !== id));
    toast({ variant: "secondary", title: "Camera Removed" });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddCamera} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="cameraName" className="block font-medium mb-1">
            Camera Name
          </label>
          <input
            id="cameraName"
            type="text"
            value={newCameraName}
            onChange={(e) => setNewCameraName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Camera Name"
          />
        </div>

        <div>
          <label htmlFor="cameraLocation" className="block font-medium mb-1">
            Camera Location
          </label>
          <input
            id="cameraLocation"
            type="text"
            value={newCameraLocation}
            onChange={(e) => setNewCameraLocation(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Camera Location"
          />
        </div>

        <div>
          <label htmlFor="streamUrl" className="block font-medium mb-1">
            Stream URL
          </label>
          <input
            id="streamUrl"
            type="text"
            value={newStreamUrl}
            onChange={(e) => setNewStreamUrl(e.target.value)}
            className="input input-bordered w-full"
            placeholder="rtsp://example.com/stream"
          />
        </div>

        <div>
          <label htmlFor="videoFile" className="block font-medium mb-1">
            Video File
          </label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setVideoFile(e.target.files[0]);
              }
            }}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Camera size={18} />
          <span>Add Camera</span>
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-2">Configured Cameras</h2>
        {cameras.length === 0 && (
          <p className="text-sm text-muted-foreground">No cameras added yet.</p>
        )}
        <ul className="space-y-4">
          {cameras.map(({ id, name, location, streamUrl }) => (
            <li
              key={id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">{location}</p>
                <p className="text-sm text-muted-foreground">{streamUrl}</p>
              </div>
              <button
                onClick={() => handleDeleteCamera(id)}
                className="btn btn-destructive btn-sm"
                aria-label={`Remove camera ${name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
