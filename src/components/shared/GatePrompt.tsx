import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface GatePromptProps {
  message?: string;
}

export const GatePrompt: React.FC<GatePromptProps> = ({
  message = 'Sign in for full access to historical data, analytics, and export tools.',
}) => {
  return (
    <div className="relative mt-4 overflow-hidden rounded-lg border border-accent bg-ghana-gold-light p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Lock className="h-6 w-6 text-accent" />
        <p className="font-body text-sm font-medium text-foreground">{message}</p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};
