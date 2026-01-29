'use client';

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
          U
        </div>
      </div>
    </header>
  );
}
