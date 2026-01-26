import { SiteHeader } from '@/components/site/SiteHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-hero">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-6">{children}</main>
      <footer className="py-12 border-t bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2026 Ultimate Apartment Manager. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

