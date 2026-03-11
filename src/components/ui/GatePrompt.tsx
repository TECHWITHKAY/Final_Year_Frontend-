import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface GatePromptProps {
  className?: string;
}

export const GatePrompt: React.FC<GatePromptProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-white/40 dark:bg-black/60 rounded-xl border border-white/20 dark:border-white/10 ${className}`}>
      <h3 className="text-xl font-bold text-foreground mb-2">Sign in for full access</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        Advanced analytics, historical trends, and city breakdowns require a free account.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <Link 
          to="/register" 
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-accent-foreground shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
        >
          Create Free Account <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-mid transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
