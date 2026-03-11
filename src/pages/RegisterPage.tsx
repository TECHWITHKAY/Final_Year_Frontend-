import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <span className="text-6xl">🌍</span>
          <h2 className="mt-6 font-display text-4xl font-bold text-primary-foreground">Join CommodityGH</h2>
          <p className="mt-4 text-primary-foreground/70 max-w-sm">Free access to Ghana's most comprehensive commodity price data.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <span className="text-xl">🇬🇭</span>
              <span className="font-display text-lg font-bold text-primary">CommodityGH</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Start tracking commodity prices for free.</p>
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
                <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
                <input
                  type={type} value={(form as any)[field]} onChange={update(field)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={placeholder} required
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-accent py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Field agent accounts require admin verification. Contact commoditygh@admin.com to request agent access.
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
