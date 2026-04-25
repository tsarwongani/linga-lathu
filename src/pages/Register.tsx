import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { UserPlus, Phone, Lock, User, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (phone.length < 9) throw new Error('Invalid phone number');
      
      const email = `${phone.replace(/\+/g, '')}@lingalathu.com`;
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        phoneNumber: phone,
        role,
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full py-12"
      >
        <div className="text-center mb-8">
           <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20 mx-auto mb-4"
          >
            <Activity size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Join Linga Lathu</h1>
          <p className="text-slate-500 mt-2">Healthcare at your fingertips</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'patient' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'doctor' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}
              >
                Doctor
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="John Banda"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="0991234567"
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

            {role === 'doctor' && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Doctor profiles require medical license verification after registration.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/20"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
