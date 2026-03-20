"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please check your email link.");
    }
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    setSuccess("");
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password: form.password,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) return null;

  return (
    <div className="w-full max-w-md soft-card p-10">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
        <h1 className="text-2xl font-extrabold tracking-tight text-center">Set New Password</h1>
      </div>

      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          Enter your new password below to regain access to your account.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 h-12 px-4 py-3 text-base pr-12"
              required
              disabled={!!success}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent/50"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />)
              }
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="********"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="mt-1 h-12 px-4 py-3 text-base pr-12"
              required
              disabled={!!success}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent/50"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />)
              }
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-sm text-red-500 text-center font-medium">{error}</div>
        ) : null}
        
        {success ? (
          <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-lg animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-center font-semibold">{success}</p>
          </div>
        ) : (
          <Button type="submit" disabled={loading || !token} className="mt-2 h-12">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Password
          </Button>
        )}
      </form>
    </div>
  );
}
