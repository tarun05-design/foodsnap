"use client";

import { Camera, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { pending } = useFormStatus();

  useEffect(() => {
    const getCameraDevices = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setActiveDeviceId(videoDevices[0].deviceId);
            }
        } catch (error) {
            // Permission denied or no camera found, handled in startCamera
        }
    };
    getCameraDevices();
  }, []);


  const startCamera = async (deviceId?: string) => {
    // Stop any existing stream
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasCameraPermission(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (!activeDeviceId && devices.length > 0) {
        const currentTrack = stream.getVideoTracks()[0];
        const currentDeviceId = currentTrack.getSettings().deviceId;
        setActiveDeviceId(currentDeviceId);
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      let message = "Could not access the camera. Please ensure it's not being used by another app.";
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        message = "Camera access was denied. Please enable camera permissions in your browser settings to use this feature.";
      }
      setCameraError(message);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: message,
      });
    }
  };

  const switchCamera = () => {
    if(devices.length < 2 || !activeDeviceId) return;
    const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    setActiveDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Convert data URL to Blob
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          // Create a File object
          const file = new File([blob], "foodsnap.jpg", { type: "image/jpeg" });
          
          // Use DataTransfer to create a FileList
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          // Create a new FormData and dispatch the action
          const formData = new FormData(formRef.current!);
          formData.set('image', file);
          
          // Directly call the form action
          formAction(formData);
        });
    }
  };


  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Snap a photo. Get a recipe.</CardTitle>
        <CardDescription>Ever see a dish and wonder how to make it? Now you can. Just upload a photo or use your camera.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-6">
          <Tabs defaultValue="upload" className="w-full" onValueChange={(value) => {
            if (value === 'camera') {
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
                className="group relative mt-4 cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
                onClick={handleUploadCardClick}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                  {previewUrl ? (
                    <div className="relative h-48 w-full max-w-sm">
                      <Image src={previewUrl} alt="Image preview" fill objectFit="contain" className="rounded-md" />
                    </div>
                  ) : (
                    <>
                      <Camera className="h-12 w-12" />
                      <p className="font-semibold text-foreground">Click to select your delicious dish</p>
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
                  required
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
