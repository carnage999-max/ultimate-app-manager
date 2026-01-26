"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

export default function AuthForm({ initialMode = "login" as Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess("");
    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await axios.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setSuccess("Account created. Redirecting…");
      } else {
        await axios.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        setSuccess("Signed in. Redirecting…");
      }
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl soft-card p-10">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
        <h1 className="text-2xl font-extrabold tracking-tight">Ultimate Apartment Manager</h1>
      </div>

      <div className="flex items-center justify-center gap-3 mb-8">
        <Button
          type="button"
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => setMode("login")}
          className="px-6"
        >
          Sign In
        </Button>
        <Button
          type="button"
          variant={mode === "register" ? "default" : "outline"}
          onClick={() => setMode("register")}
          className="px-6"
        >
          Create Account
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <Input
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-12 px-4 py-3 text-base"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 h-12 px-4 py-3 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 h-12 px-4 py-3 text-base pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />)
              }
            </button>
          </div>
        </div>
        {mode === "register" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="********"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="mt-1 h-12 px-4 py-3 text-base pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent/50"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />)
                }
              </button>
            </div>
          </div>
        )}

        {error ? (
          <div className="text-sm text-red-500 text-center font-medium">{error}</div>
        ) : null}
        {success ? (
          <div className="text-sm text-emerald-600 text-center font-medium">{success}</div>
        ) : null}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>

        <div className="text-center text-sm mt-2">
          {mode === "login" ? (
            <>
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-medium text-secondary hover:text-secondary/80 underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-secondary hover:text-secondary/80 underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}



