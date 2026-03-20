"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="soft-card p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          <p className="text-muted-foreground font-medium">Loading reset form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
