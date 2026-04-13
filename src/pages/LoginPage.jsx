import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

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
    <div className="bg-slate-50 min-h-screen pt-20 px-4">
      <div className="mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-8" style={{ maxWidth: '400px', width: '100%' }}>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">BridgeSync</h2>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {loginError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md text-sm mb-6">
            {loginError.message || 'Login failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              style={{ width: '100%' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              style={{ width: '100%' }}
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="bg-slate-900 text-white font-medium py-2.5 px-4 rounded-md hover:bg-slate-800 disabled:opacity-50 mt-2"
            style={{ width: '100%' }}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
          <span className="text-slate-600">Don't have an account? </span>
          <Link to="/signup" className="text-slate-900 hover:text-slate-700 font-semibold underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
