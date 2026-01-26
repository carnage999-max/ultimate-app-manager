'use client';

import AuthForm from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm initialMode="register" />
    </div>
  );
}

