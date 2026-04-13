import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

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
    <div className="bg-slate-50 min-h-screen pt-20 px-4">
      <div className="mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-8" style={{ maxWidth: '400px', width: '100%' }}>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">BridgeSync</h2>
          <p className="text-sm text-slate-500 mt-2">Create a new account</p>
        </div>

        {registerError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md text-sm mb-6">
            {registerError.message || 'Registration failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              style={{ width: '100%' }}
              placeholder="John Doe"
            />
          </div>

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
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              style={{ width: '100%' }}
            >
              <option value="Developer">Developer</option>
              <option value="BrSE">BrSE</option>
              <option value="PM">PM</option>
              <option value="Japanese client">Japanese client</option>
            </select>
          </div>

          <button
             type="submit"
             disabled={isRegistering}
             className="bg-slate-900 text-white font-medium py-2.5 px-4 rounded-md hover:bg-slate-800 disabled:opacity-50 mt-4"
             style={{ width: '100%' }}
          >
            {isRegistering ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
          <span className="text-slate-600">Already have an account? </span>
          <Link to="/login" className="text-slate-900 hover:text-slate-700 font-semibold underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
