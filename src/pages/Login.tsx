import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { LogIn, Phone, Lock, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In this system, we use phoneNumber@lingalathu.com as a mock email for Firebase Auth
      const email = `${phone.replace(/\+/g, '')}@lingalathu.com`;
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 mx-auto mb-6"
          >
            <div className="text-2xl font-black italic">L</div>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Linga Lathu</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Health Queue Intelligence</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0991234567"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-600/30 active:scale-[0.98]"
            >
              {loading ? "Initializing..." : "Authorize Access"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
            New to system?{' '}
            <Link to="/register" className="text-blue-600 font-black hover:underline block mt-1">
              Request Practitioner Access
            </Link>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <div className="p-5 bg-white/50 rounded-[1.5rem] border border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Signal Status</p>
            <p className="text-xs font-black text-emerald-600 uppercase">Operational</p>
          </div>
          <Link to="/queue-public/main" className="p-5 bg-white/50 rounded-[1.5rem] border border-slate-200 text-center hover:bg-slate-100 transition-all group">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 group-hover:text-blue-600">Public Hub</p>
            <p className="text-xs font-black text-slate-800 uppercase">Live Queue</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
