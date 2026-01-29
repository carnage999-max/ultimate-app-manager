'use client';

import { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader2, CreditCard } from 'lucide-react';

// Replace with your actual publishable key or environment variable
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const paymentsConfigured = Boolean(publishableKey && !publishableKey.includes('placeholder'));
const stripePromise = paymentsConfigured ? loadStripe(publishableKey) : null;

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/payments`,
      },
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
    } else {
       setMessage('Payment successful!');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button disabled={isProcessing || !stripe || !elements} className="w-full mt-4">
        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
        Pay ${amount}
      </Button>
      {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
    </form>
  );
}

export default function PaymentsPage() {
  const [amount, setAmount] = useState('1200');
  const [clientSecret, setClientSecret] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState('');

  const initiatePayment = async () => {
    if (isInitiating) return; // prevent double init
    setIsInitiating(true);
    try {
      const res = await axios.post('/api/payments/create-intent', {
        amount: parseFloat(amount),
      }, { withCredentials: true });
      setError('');
      setClientSecret(res.data.clientSecret);
    } catch (error) {
      console.error(error);
      const message = (error as any)?.response?.data?.error || 'Failed to initialize payment.';
      setError(message);
      setClientSecret('');
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage your rent and fees.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Make a Payment</h3>
              {!paymentsConfigured ? (
                 <div className="space-y-4 text-sm text-muted-foreground">
                    <p>Payments are not configured yet. Add your Stripe publishable and secret keys to the environment to enable card collection.</p>
                    <pre className="rounded-lg bg-muted p-3 text-xs text-foreground whitespace-pre-wrap">
{`# .env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`}
                    </pre>
                 </div>
              ) : !clientSecret ? (
                <div className="space-y-4">
                   <div>
                     <label className="text-sm font-medium">Payment Amount ($)</label>
                     <Input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1"
                     />
                   </div>
                   <Button onClick={initiatePayment} className="w-full" disabled={isInitiating}>
                      {isInitiating ? (<><Loader2 className="animate-spin mr-2 h-4 w-4" />Processing...</>) : 'Proceed to Pay'}
                   </Button>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                    {stripePromise ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm amount={parseFloat(amount)} />
                      </Elements>
                    ) : null}
                </div>
              )}
              {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
           </Card>

           <Card className="p-6 bg-muted/20 hover:-translate-y-0.5 transition-transform">
              <h3 className="font-semibold text-lg mb-4">Payment History</h3>
              <div className="space-y-4">
                  {/* Placeholder History */}
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                             <p className="font-medium">Rent Payment</p>
                             <p className="text-xs text-muted-foreground">Dec 01, 2025</p>
                          </div>
                       </div>
                       <span className="font-bold">$1,200.00</span>
                    </div>
                  ))}
              </div>
           </Card>
        </div>
    </div>
  );
}

