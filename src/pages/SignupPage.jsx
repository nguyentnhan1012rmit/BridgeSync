import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ChevronDown, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const { register, isRegistering, registerError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Developer'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="auth-card w-full max-w-[420px] p-8 sm:p-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create account</h2>
          <p className="text-sm text-text-muted mt-1.5">Join your team on BridgeSync</p>
        </div>

        {/* Error Banner */}
        {registerError && (
          <div className="flex items-center gap-2.5 bg-danger/8 text-danger border border-danger/15 p-3.5 rounded-xl text-sm mb-6 animate-[slideUp_200ms_ease]">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{registerError.message || 'Registration failed. Please try again.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input appearance-none pr-10 cursor-pointer"
              >
                <option value="Developer">Developer</option>
                <option value="BrSE">BrSE</option>
                <option value="PM">PM</option>
                <option value="Japanese client">Japanese client</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
             type="submit"
             disabled={isRegistering}
             className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-medium
               py-2.5 px-4 rounded-xl hover:bg-primary-light active:bg-primary-dark
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
               shadow-sm hover:shadow-md cursor-pointer mt-2"
          >
            {isRegistering ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Sign up
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm border-t border-border pt-6">
          <span className="text-text-muted">Already have an account? </span>
          <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
