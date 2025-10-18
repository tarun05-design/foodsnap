
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last updated: October 18, 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              Thank you for using FoodSnap. This Privacy Policy explains how we handle your information when you use our application.
            </p>

            <h3 className="font-headline text-xl font-semibold pt-4">Information We Collect</h3>
            <p>
              When you use our service to identify a dish, you may provide us with an image by either uploading it or taking a picture with your device's camera.
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li>
                    <strong>Images:</strong> We collect the images you upload or capture. These images are used solely for the purpose of identifying the food items depicted.
                </li>
                <li>
                    <strong>Camera Access:</strong> To allow you to take a picture directly within the app, we request permission to access your device's camera. We only activate the camera when you select the "Camera" option, and we do not access it at any other time.
                </li>
            </ul>

            <h3 className="font-headline text-xl font-semibold pt-4">How We Use Your Information</h3>
            <p>
              Your images are sent to a third-party Generative AI service (Google's Gemini models) for analysis. The AI processes the image to identify the dish and generate a corresponding recipe. We do not store your images on our servers after the analysis is complete. The data is used for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Identifying the dish in the photo.</li>
              <li>Generating a relevant recipe and nutritional information.</li>
              <li>Providing you with the core functionality of the FoodSnap application.</li>
            </ul>

            <h3 className="font-headline text-xl font-semibold pt-4">Data Sharing and Third Parties</h3>
            <p>
              We share the images you provide with Google's Generative AI services to perform the food recognition and recipe generation. We do not sell or share your personal data with any other third parties for marketing or other purposes.
            </p>

            <h3 className="font-headline text-xl font-semibold pt-4">Your Consent</h3>
            <p>
              By using our app, you consent to our Privacy Policy.
            </p>

            <h3 className="font-headline text-xl font-semibold pt-4">Changes to Our Privacy Policy</h3>
            <p>
              If we decide to change our privacy policy, we will post those changes on this page.
            </p>

            <h3 className="font-headline text-xl font-semibold pt-4">Disclaimer</h3>
            <p>
                This is a placeholder privacy policy. You should consult with a legal professional to ensure it meets all legal requirements for your specific use case and jurisdiction before publishing your app.
            </p>

            <div className="pt-6">
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
