
"use client";

import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";
import { useRef, useState } from "react";
import Image from "next/image";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Snap a photo. Get a recipe.</CardTitle>
        <CardDescription>Ever see a dish and wonder how to make it? Now you can. Just upload a photo to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
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

          <div className="flex justify-center">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
