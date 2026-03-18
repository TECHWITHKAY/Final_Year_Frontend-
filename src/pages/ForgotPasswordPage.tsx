import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword } from '@/api/auth';
import { toast } from 'sonner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset instructions sent if an account exists.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-8 md:p-10 rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm"
        >
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to login
          </Link>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground">Forgot password?</h1>
                  <p className="mt-2 text-muted-foreground">No worries, we'll send you reset instructions.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                        placeholder="Enter your email" 
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-xl bg-accent py-3.5 text-base font-bold text-accent-foreground shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
                <p className="text-muted-foreground mb-8">
                  We've sent password reset instructions to <br/><span className="font-semibold text-foreground">{email}</span>
                </p>
                <Link 
                  to="/login"
                  className="inline-block w-full rounded-xl bg-secondary py-3.5 text-base font-bold text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Return to login
                </Link>
                <p className="mt-6 text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button onClick={() => setSubmitted(false)} className="text-primary font-bold hover:underline">try again</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
