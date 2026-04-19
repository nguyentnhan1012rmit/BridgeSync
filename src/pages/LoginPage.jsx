import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const { login, isLoggingIn, isLoginSuccess, loginError } = useAuth();
  
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
    <div className="auth-bg">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl mb-5 shadow-[0_0_20px_oklch(0.65_0.25_300/0.4)]">
            <span className="text-white font-bold text-2xl tracking-tighter drop-shadow-md">B</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="form-input w-full !pl-11 py-3 text-sm"
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
                className="form-input w-full pl-11 py-3 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className={`w-full mt-4 ${isLoginSuccess ? 'bg-success border-success shadow-[0_0_15px_oklch(0.75_0.15_150/0.3)] hover:brightness-100 scale-[0.98]' : ''}`}
            size="lg"
            disabled={isLoggingIn || isLoginSuccess}
            icon={isLoggingIn ? null : isLoginSuccess ? CheckCircle : LogIn}
          >
            {isLoggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-[oklch(1_1_1/0.3)] border-t-white rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : isLoginSuccess ? (
              'Success!'
            ) : (
              'Sign in'
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
