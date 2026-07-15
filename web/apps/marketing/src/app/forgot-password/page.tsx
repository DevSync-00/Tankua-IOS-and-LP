import Link from "next/link";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { Button, Card } from "@tankua/ui";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8F6F0] to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1A2F]">Reset Your Password</h1>
        <p className="text-[#0A1A2F]/70 mt-3">
          Customer account recovery is handled in the Tankua mobile app. Provider accounts can reset
          from the provider portal.
        </p>
        <div className="space-y-3 mt-8">
          <Link href="/download">
            <Button className="w-full bg-[#D4A017] hover:bg-[#B8860B]" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download App
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
