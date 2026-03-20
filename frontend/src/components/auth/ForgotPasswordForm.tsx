"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess("");
    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setSuccess(response.data.message || "Reset link sent!");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md soft-card p-10">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
        <h1 className="text-2xl font-extrabold tracking-tight text-center">Reset Password</h1>
      </div>

      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-12 px-4 py-3 text-base"
            required
          />
        </div>

        {error ? (
          <div className="text-sm text-red-500 text-center font-medium">{error}</div>
        ) : null}
        {success ? (
          <div className="text-sm text-emerald-600 text-center font-medium p-3 bg-emerald-50 rounded-lg">{success}</div>
        ) : null}

        <Button type="submit" disabled={loading || success !== ""} className="mt-2 h-12">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </Button>

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
