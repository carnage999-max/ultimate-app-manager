"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero px-4 py-12 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  );
}
