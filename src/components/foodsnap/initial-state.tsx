
"use client";

import { Camera, Upload, Video, X, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type InitialStateProps = {
  formAction: (payload: FormData) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      <Upload className="mr-2 h-4 w-4" />
      {pending ? "Analyzing..." : "Get the Recipe"}
    </Button>
  );
}

export default function InitialState({ formAction }: InitialStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);

  const { toast } = useToast();

  const stopCameraStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const getCameraPermission = useCallback(async () => {
    // Stop any existing stream before starting a new one
    stopCameraStream();

    try {
      // First get the list of devices
      const availableDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = availableDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length === 0) {
        throw new Error('No video input devices found.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: { 
            exact: videoDevices[activeDeviceIndex].deviceId 
          } 
        } 
      });

      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [activeDeviceIndex, toast, stopCameraStream]);


  useEffect(() => {
    if (showCamera) {
      getCameraPermission();
    } else {
      stopCameraStream();
    }

    // Cleanup function to stop stream when component unmounts or showCamera becomes false
    return () => {
      stopCameraStream();
    };
  }, [showCamera, getCameraPermission, stopCameraStream]);


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

  const handleSwitchCamera = () => {
    if(devices.length > 1) {
      setActiveDeviceIndex((prevIndex) => (prevIndex + 1) % devices.length);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);

        // This is a bit of a hack to create a "File" from the data URL to submit in the form
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if(fileInputRef.current) {
              fileInputRef.current.files = dataTransfer.files;
            }
          })
        setShowCamera(false);
      }
    }
  };


  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Snap a photo. Get a recipe.</CardTitle>
        <CardDescription>Ever see a dish and wonder how to make it? Now you can. Just upload a photo to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" onClick={() => setShowCamera(false)}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </TabsTrigger>
              <TabsTrigger value="camera" onClick={() => { setShowCamera(true); setPreviewUrl(null); }}>
                <Video className="mr-2 h-4 w-4" /> Camera
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                className="group relative mt-4 cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
                onClick={handleUploadCardClick}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                  {previewUrl && !showCamera ? (
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
                  required={!showCamera}
                />
              </div>
            </TabsContent>
            <TabsContent value="camera">
               <div className="mt-4 flex flex-col items-center gap-4">
                {previewUrl && showCamera ? (
                    <div className="relative h-48 w-full max-w-sm">
                      <Image src={previewUrl} alt="Image preview" fill objectFit="contain" className="rounded-md" />
                       <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white" onClick={() => setPreviewUrl(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                  <>
                    <div className="w-full max-w-sm overflow-hidden rounded-lg border relative">
                      <video ref={videoRef} className="w-full aspect-video" autoPlay muted playsInline />
                      <canvas ref={canvasRef} className="hidden" />
                      {devices.length > 1 && (
                        <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/70 hover:text-white">
                          <SwitchCamera className="h-4 w-4"/>
                        </Button>
                      )}
                    </div>
                     {hasCameraPermission === false && (
                      <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access to use this feature.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
                 {!previewUrl && (
                  <Button onClick={handleCapture} disabled={!hasCameraPermission} type="button">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

    