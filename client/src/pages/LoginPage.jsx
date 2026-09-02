import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">OrderFlow</h1>
          <p className="text-sm text-muted-foreground">Premium Order & Indent Management System</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@orderflow.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Fill */}
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Development Accounts (Click to Fill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@orderflow.com', 'Admin123!')}
                className="px-2.5 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors truncate"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@orderflow.com', 'Manager123!')}
                className="px-2.5 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors truncate"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@orderflow.com', 'Employee123!')}
                className="px-2.5 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors truncate"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 OrderFlow Enterprise Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
