
"use client";

import { Camera, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type InitialStateProps = {
  formAction: (payload: FormData) => void;
};

function SubmitButton({ pending, disabled }: { pending: boolean, disabled?: boolean }) {
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      <Upload className="mr-2 h-4 w-4" />
      {pending ? "Analyzing..." : "Get the Recipe"}
    </Button>
  );
}

export default function InitialState({ formAction }: InitialStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { pending } = useFormStatus();

  const getCameraDevices = useCallback(async () => {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            throw new Error("Camera features are not supported in this browser.");
        }
        await navigator.mediaDevices.getUserMedia({ video: true }); // Prompt for permission
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !activeDeviceId) {
            setActiveDeviceId(videoDevices[0].deviceId);
        }
    } catch (error) {
        console.error('Error enumerating camera devices:', error);
        let message = "Could not access the camera. Please ensure it's not being used by another app.";
        if (error instanceof DOMException) {
            if (error.name === "NotAllowedError") {
              message = "Camera access was denied. Please enable camera permissions in your browser settings to use this feature.";
            } else if (error.name === "NotFoundError") {
              message = "No camera was found on your device.";
            }
        }
        setCameraError(message);
        setHasCameraPermission(false);
    }
  }, [activeDeviceId]);

  const startCamera = useCallback(async (deviceId?: string) => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }

    try {
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error("Camera access is only available on secure (HTTPS) connections or localhost.");
      }
      const constraints = { video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasCameraPermission(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const currentTrack = stream.getVideoTracks()[0];
      const currentDeviceId = currentTrack.getSettings().deviceId;
      if (currentDeviceId && !devices.some(d => d.deviceId === currentDeviceId)) {
          // If the active stream's device is not in the list, refresh the list.
          getCameraDevices();
      }
      setActiveDeviceId(currentDeviceId);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      let message = "Could not access the camera. Please ensure it's not being used by another app.";
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          message = "Camera access was denied. Please enable camera permissions in your browser settings to use this feature.";
        } else if (error.name === "NotFoundError") {
            message = "No camera was found for the selected option."
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      setCameraError(message);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: message,
      });
    }
  }, [devices, getCameraDevices, toast]);

  const switchCamera = () => {
    if(devices.length < 2 || !activeDeviceId) return;
    const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    if (nextDevice) {
        setActiveDeviceId(nextDevice.deviceId);
        startCamera(nextDevice.deviceId);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files;
      }
    } else {
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please use a valid image file (PNG, JPG, or WEBP).",
        });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current && cameraInputRef.current && formRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "foodsnap-camera.jpg", { type: "image/jpeg" });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          cameraInputRef.current!.files = dataTransfer.files;
          
          // Programmatically submit the form
          formRef.current?.requestSubmit();
        });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    handleDrag(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Snap a photo. Get a recipe.</CardTitle>
        <CardDescription>Ever see a dish and wonder how to make it? Now you can. Just upload a photo to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-6">
          <Tabs defaultValue="upload" className="w-full" onValueChange={(value) => {
            if (value === 'camera') {
                if (devices.length === 0) {
                    getCameraDevices();
                }
                startCamera(activeDeviceId);
            } else {
               if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
              }
            }
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" /> Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                className={cn(
                    "group relative mt-4 cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5",
                    isDragging && "border-primary bg-primary/10 ring-2 ring-primary"
                )}
                onClick={handleUploadCardClick}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground pointer-events-none">
                  {previewUrl ? (
                    <div className="relative h-48 w-full max-w-sm">
                      <Image src={previewUrl} alt="Image preview" fill objectFit="contain" className="rounded-md" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12" />
                      <p className="font-semibold text-foreground">Click or drag & drop to upload</p>
                      <p className="text-xs">PNG, JPG, or WEBP supported</p>
                    </>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  id="image-upload"
                  name="image"
                  type="file"
                  className="sr-only"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mt-6 flex justify-center">
                <SubmitButton pending={pending} disabled={!previewUrl} />
              </div>
            </TabsContent>
            <TabsContent value="camera">
                <div className="relative mt-4 flex flex-col items-center justify-center gap-4">
                    <div className="relative w-full overflow-hidden rounded-lg border-2 border-dashed border-border">
                        <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                         {cameraError && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                <Alert variant="destructive">
                                    <AlertTitle>Camera Error</AlertTitle>
                                    <AlertDescription>{cameraError}</AlertDescription>
                                </Alert>
                             </div>
                        )}
                        {hasCameraPermission === undefined && (
                             <div className="absolute inset-0 flex items-center justify-center bg-background">
                                <p>Requesting camera access...</p>
                             </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <Input ref={cameraInputRef} type="file" name="image" className="sr-only" />

                    <div className="flex w-full items-center justify-center gap-4">
                        <Button type="button" size="lg" onClick={takePicture} disabled={!hasCameraPermission || pending}>
                            <Camera className="mr-2 h-4 w-4" />
                            {pending ? 'Analyzing...' : 'Take Picture'}
                        </Button>
                        {devices.length > 1 && (
                            <Button type="button" variant="outline" size="icon" onClick={switchCamera} disabled={!hasCameraPermission}>
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Switch Camera</span>
                            </Button>
                        )}
                    </div>
                </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}

    