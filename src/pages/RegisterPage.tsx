import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: form.fullName, username: form.username, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Immersive Background */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-primary">
        {/* Background Image with Ken Burns */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Market2.jpg"
            alt="Ghanaian Market"
            className="w-full h-full object-cover animate-ken-burns"
            style={{ animationIterationCount: 'infinite', animationDirection: 'alternate', animationDuration: '20s' }}
          />
          {/* Dark Green Overlay */}
          <div className="absolute inset-0 bg-[#143C14]/75" />
        </div>

        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <span className="text-3xl transform group-hover:scale-110 transition-transform">🇬🇭</span>
            <span className="font-display text-2xl font-bold text-primary-foreground tracking-tight">
              CommodityGH
            </span>
          </Link>

          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-bold text-primary-foreground leading-tight"
            >
              Building a Transparent <br /> Future for Agriculture.
            </motion.h2>
            
            <ul className="mt-10 space-y-6">
              {[
                'Real-time prices across 10+ markets',
                '5 cities tracked daily',
                'Trusted by traders & policymakers'
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-3 text-primary-foreground/90 text-lg font-medium"
                >
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="text-primary-foreground/50 text-sm">
            © 2026 CommodityGH. Empowering Ghana's agricultural ecosystem.
          </p>
        </div>
      </div>

      {/* Right panel - Refined Form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-card p-8 md:p-12 rounded-2xl md:shadow-xl md:border">
          <div className="lg:hidden text-center">
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl">🇬🇭</span>
              <span className="font-display text-xl font-bold text-primary">CommodityGH</span>
            </Link>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Create account</h1>
            <p className="mt-2 text-muted-foreground">Join the smarter way to track prices.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', field: 'fullName', type: 'text', placeholder: 'Kwame Asante' },
              { label: 'Username', field: 'username', type: 'text', placeholder: 'kwameasante' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'kwame@example.com' },
              { label: 'Password', field: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', field: 'confirmPassword', type: 'password', placeholder: '••••••••' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>
                <input
                  type={type} value={(form as any)[field]} onChange={update(field)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                  placeholder={placeholder} required
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-accent py-3.5 text-base font-bold text-accent-foreground shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Field agent accounts require admin verification. Contact commoditygh@admin.com to request agent access.
          </p>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-mid transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
