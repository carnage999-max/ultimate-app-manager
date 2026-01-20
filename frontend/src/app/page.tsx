import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Key, CreditCard, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 h-16 flex items-center justify-between border-b backdrop-blur-md bg-background/70 sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <Image src="/logo.png" alt="Ultimate Apartment Manager" width={32} height={32} className="rounded-md" />
           <span className="text-xl font-bold tracking-tight">UltiManager</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:text-secondary transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-secondary transition-colors">Pricing</Link>
          <Link href="#contact" className="hover:text-secondary transition-colors">Contact</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
             <Button>Get Started</Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32 bg-background">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background"></div>
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
               The Ultimate <br/> Apartment Management
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your property management with our all-in-one platform. 
              Leases, payments, maintenance, and more - all in one beautiful dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">Start Free Trial</Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">View Demo</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-muted/30">
           <div className="container px-4 md:px-6 mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
               <p className="mt-4 text-muted-foreground">Comprehensive tools for landlords and tenants.</p>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
               <FeatureCard 
                 icon={<Key className="h-10 w-10 text-secondary" />}
                 title="Lease Management"
                 description="Digital leasing, document storage, and automated renewals."
               />
               <FeatureCard 
                 icon={<CreditCard className="h-10 w-10 text-secondary" />}
                 title="Online Payments"
                 description="Seamless rent collection via Stripe with auto-reminders."
               />
               <FeatureCard 
                 icon={<ShieldCheck className="h-10 w-10 text-secondary" />}
                 title="Secure & Reliable"
                 description="Bank-grade security for your data and transactions."
               />
             </div>
           </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-sm text-muted-foreground">© 2026 Ultimate Apartment Manager. All rights reserved.</p>
           <div className="flex gap-6 text-sm text-muted-foreground">
             <Link href="#" className="hover:underline">Terms</Link>
             <Link href="#" className="hover:underline">Privacy</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
