'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[60vh] container mx-auto px-4 md:px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="text-muted-foreground mt-2">We'd love to show you a demo or answer any questions.</p>
      <form onSubmit={submit} className="mt-8 max-w-xl space-y-4">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-muted px-4 py-3 rounded-lg border"
        />
        <textarea
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full bg-muted px-4 py-3 rounded-lg border"
        />
        <button className="px-5 py-3 rounded-lg bg-foreground text-background font-semibold">Send</button>
        {sent ? <div className="text-green-600">Thanks! We will be in touch.</div> : null}
      </form>
    </div>
  );
}

