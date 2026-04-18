import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center p-4 min-h-screen">
      <div className="auth-card w-full max-w-[420px] p-8 sm:p-10 shadow-xl bg-surface-raised">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-sm">
            <span className="text-white font-bold text-xl tracking-tighter">B</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Sign in to your BridgeSync account
          </p>
        </div>

        {/* Error Banner */}
        {loginError && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{loginError.message || 'Login failed. Please try again.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full pl-10 py-2.5 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input w-full pl-10 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                Sign in
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-border text-center text-sm">
          <span className="text-text-muted">Don't have an account? </span>
          <Link to="/signup" className="text-primary hover:text-primary-light font-semibold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
