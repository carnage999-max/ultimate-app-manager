"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Key, CreditCard, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32 bg-hero">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <Image src="/logo.png" alt="Ultimate Apartment Manager" width={90} height={90} className="rounded-2xl shadow-lg" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              The Ultimate <br/> Apartment Management
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your property management with our all-in-one platform. Leases, payments, maintenance, and more — all in one beautiful dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg">Get Started</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg">View Demo</Button>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 left-0 right-0 h-20 -z-10 bg-muted/30" style={{ clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0% 100%)" }} />
        </section>

        

        <section id="features" className="relative py-24 bg-muted/30 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
              <p className="mt-4 text-muted-foreground">Comprehensive tools for landlords and tenants.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard icon={<Key className="h-10 w-10 text-secondary" />} title="Lease Management" description="Digital leasing, document storage, and automated renewals." />
              <FeatureCard icon={<CreditCard className="h-10 w-10 text-secondary" />} title="Online Payments" description="Seamless rent collection via Stripe with auto-reminders." />
              <FeatureCard icon={<ShieldCheck className="h-10 w-10 text-secondary" />} title="Secure & Reliable" description="Bank-grade security for your data and transactions." />
            </div>
          </div>
          <div className="pointer-events-none absolute -top-10 left-0 right-0 h-20 -z-10 bg-background" style={{ clipPath: "polygon(0 0, 100% 60%, 100% 100%, 0% 100%)" }} />
        </section>

        
      </main>

      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2026 Ultimate Apartment Manager. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Reveal>
      <div className="soft-card p-6 transition-all duration-700 ease-out will-change-transform">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Reveal>
  );
}

