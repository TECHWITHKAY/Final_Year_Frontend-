import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, MapPin, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { registerAgent } from '@/api/auth';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ 
    fullName: '', 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    operatingCity: '',
    applicationNote: ''
  });
  const [role, setRole] = useState<'VIEWER' | 'FIELD_AGENT'>('VIEWER');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (role === 'FIELD_AGENT') {
        await registerAgent({
          username: form.username,
          email: form.email,
          password: form.password,
          operatingCity: form.operatingCity,
          applicationNote: form.applicationNote
        });
        toast.success('Agent application submitted! Awaiting admin review.');
        navigate('/login');
      } else {
        await register({ 
          fullName: form.fullName, 
          username: form.username, 
          email: form.email, 
          password: form.password,
          role: role
        });
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
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
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Market2.jpg"
            alt="Ghanaian Market"
            className="w-full h-full object-cover animate-ken-burns"
            style={{ animationIterationCount: 'infinite', animationDirection: 'alternate', animationDuration: '20s' }}
          />
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

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground">Join as</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('VIEWER')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === 'VIEWER' 
                    ? 'border-accent bg-accent/5 shadow-md' 
                    : 'border-input hover:border-accent/40 bg-background'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'VIEWER' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Analyst</p>
                  <p className="text-[10px] text-muted-foreground">View prices & trends</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('FIELD_AGENT')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === 'FIELD_AGENT' 
                    ? 'border-accent bg-accent/5 shadow-md' 
                    : 'border-input hover:border-accent/40 bg-background'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'FIELD_AGENT' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Field Agent</p>
                  <p className="text-[10px] text-muted-foreground">Submit market data</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Username</label>
                  <input
                    type="text" value={form.username} onChange={update('username')}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                    placeholder="kwameasante" required
                  />
               </div>
               <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email" value={form.email} onChange={update('email')}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                    placeholder="kwame@example.com" required
                  />
               </div>
            </div>

            <AnimatePresence mode="popLayout">
              {role === 'FIELD_AGENT' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground text-accent">
                      <Building2 className="h-4 w-4" /> Operating City
                    </label>
                    <input
                      type="text" value={form.operatingCity} onChange={update('operatingCity')}
                      className="w-full rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                      placeholder="e.g. Accra, Kumasi" required={role === 'FIELD_AGENT'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground text-accent">
                      <FileText className="h-4 w-4" /> Application Note
                    </label>
                    <textarea
                      value={form.applicationNote} onChange={update('applicationNote') as any}
                      className="w-full rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm min-h-[80px]"
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`grid grid-cols-1 ${role === 'VIEWER' ? 'md:grid-cols-2' : ''} gap-4`}>
              <div className={role === 'VIEWER' ? '' : 'hidden'}>
                <label className="mb-2 block text-sm font-semibold text-foreground">Full Name</label>
                <input
                  type="text" value={form.fullName} onChange={update('fullName')}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                  placeholder="Kwame Asante" required={role === 'VIEWER'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
                <input
                  type="password" value={form.password} onChange={update('password')}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                  placeholder="••••••••" required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Confirm Password</label>
                <input
                  type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                  placeholder="••••••••" required
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-accent py-4 text-base font-bold text-accent-foreground shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4">
              {loading ? 'Processing...' : role === 'FIELD_AGENT' ? 'Submit Application' : 'Create Analyst Account'}
            </button>
          </form>

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
