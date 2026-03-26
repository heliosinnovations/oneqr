'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link!',
      });
      trackEvent.identifyUser(email, { method: 'magic_link' });
      setEmail('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link',
      });
      trackEvent.error('auth_magic_link_failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fg/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-bg p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted transition-colors hover:text-fg"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-serif text-3xl italic text-fg">
            Sign in to The QR Spot
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enter your email to receive a magic link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full border-b-2 border-border bg-transparent py-3 text-lg text-fg outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-50"
            />
          </div>

          {message && (
            <div
              className={`rounded border p-3 text-sm ${
                message.type === 'success'
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : 'border-red-600 bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-fg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted">
          <p>
            By signing in, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-fg">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
