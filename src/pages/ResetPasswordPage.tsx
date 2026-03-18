import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateResetToken, resetPassword } from '@/api/auth';
import { toast } from 'sonner';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }
      try {
        const response = await validateResetToken(token);
        setIsTokenValid(response.data.data);
      } catch (err) {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground font-medium">Validating security token...</p>
        </div>
      </div>
    );
  }

  if (!token || !isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card p-10 rounded-2xl shadow-xl border border-destructive/20 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Invalid or Expired Link</h2>
          <p className="text-muted-foreground mb-8">
            The password reset link you clicked is invalid or has expired. Please request a new one.
          </p>
          <button 
            onClick={() => navigate('/forgot-password')}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground hover:opacity-90 transition-all shadow-lg"
          >
            Request New Link
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-8 md:p-10 rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="reset-form" exit={{ opacity: 0, scale: 0.95 }}>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Reset
                  </div>
                  <h1 className="font-display text-3xl font-bold text-foreground">Set new password</h1>
                  <p className="mt-2 text-muted-foreground">Your new password must be different from previous ones.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pl-11 pr-11 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                        placeholder="••••••••" 
                        required
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                        placeholder="••••••••" 
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-xl bg-accent py-3.5 text-base font-bold text-accent-foreground shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Password reset!</h2>
                <p className="text-muted-foreground mb-8">
                  Your password has been successfully updated. <br/>Redirecting you to login...
                </p>
                <div className="flex justify-center">
                   <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                        className="h-full bg-accent"
                     />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
