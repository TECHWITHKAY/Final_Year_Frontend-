import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <span className="text-6xl">📊</span>
          <h2 className="mt-6 font-display text-4xl font-bold text-primary-foreground">Intelligence</h2>
          <p className="mt-4 text-primary-foreground/70 max-w-sm">Powering smarter commodity decisions across Ghana's markets.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <span className="text-xl">🇬🇭</span>
              <span className="font-display text-lg font-bold text-primary">CommodityGH</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to access your market intelligence.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Username or Email</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your username" required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-md bg-accent py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
