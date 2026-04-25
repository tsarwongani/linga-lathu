import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Appointment } from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const StatCard = ({ icon: Icon, label, value, trend, color, step }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-2xl", color.replace('bg-', 'bg-').replace('-500', '-50'))}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <span className="text-2xl font-black text-slate-300">{step}</span>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn("h-full", color, "w-3/4")}></div>
    </div>
  </div>
);

export default function Dashboard() {
  const { profile, isPatient, isDoctor, isAdmin } = useAuth();
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;
      
      try {
        const q = query(
          collection(db, 'appointments'),
          where(isPatient ? 'patientId' : isDoctor ? 'doctorId' : 'hospitalId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setRecentAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile, isPatient, isDoctor]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile?.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500">Queen Elizabeth Central Hospital • Lilongwe Branch</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest">Connected</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">v1.2.4 (Malawi)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Calendar} 
          label={isPatient ? "Your Queue Position" : "Total Visits"} 
          value={isPatient ? "#142" : "24"} 
          step="01" 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={Clock} 
          label="Estimated Wait" 
          value="22 mins" 
          step="02" 
          color="bg-emerald-500" 
        />
        <StatCard 
          icon={Activity} 
          label="Health Score" 
          value="Good" 
          step="03" 
          color="bg-orange-500" 
        />
        <StatCard 
          icon={Users} 
          label="In Queue" 
          value="4" 
          step="04" 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex justify-between items-center relative overflow-hidden shadow-xl shadow-blue-600/20">
            <div className="relative z-10 space-y-5">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Pre-Screening Tool</h3>
                <p className="text-blue-100 max-w-sm text-sm">Describe your symptoms to get categorized for faster queue placement.</p>
              </div>
              <Link to="/symptom-checker" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Start Symptom Check
              </Link>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-400 rounded-full opacity-10"></div>
            <Stethoscope size={100} className="text-blue-400 opacity-20 relative z-0 shrink-0" />
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 tracking-tight">Recent Activity</h3>
              <button className="text-blue-600 text-sm font-bold hover:underline">View History</button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((apt) => (
                  <div key={apt.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        apt.status === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                      )}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">
                          {apt.status === 'completed' ? "Appointment Completed" : "Appointment Confirmed"}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          General Consultation • Dr. Phiri
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-mono font-medium">{apt.timeSlot}</p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 italic text-sm">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-slate-900 mb-8 tracking-tight flex items-center justify-between">
              Live Queue Status
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
              </div>
            </h3>
            <div className="space-y-8 flex-1">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-2">Now Serving</p>
                <p className="text-5xl font-black text-blue-600 italic tracking-tighter">LL-138</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Up Next</p>
                {[139, 140, 141].map((num, i) => (
                  <div key={num} className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <p className="font-bold text-slate-800">LL-{num}</p>
                    <p className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">{3 + i * 5} min</p>
                  </div>
                ))}
              </div>
               
              <button className="w-full mt-4 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                <Activity size={16} />
                Get Queue Alert
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
            <h4 className="font-bold text-sm mb-2 tracking-tight">Clinic Hours</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Queen Elizabeth Central</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Mon - Fri</span>
                <span>08:00 - 17:00</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Saturday</span>
                <span>09:00 - 13:00</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500 text-slate-600">Sunday</span>
                <span className="text-red-500 font-bold">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
