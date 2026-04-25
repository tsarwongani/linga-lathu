import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Hospital as HospitalIcon, 
  Users, 
  Activity, 
  MapPin, 
  Settings, 
  Plus, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Hospital, UserProfile } from '../types';

const AdminStat = ({ icon: Icon, label, value, trend, trendDir }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full",
          trendDir === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trendDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn("h-full", trendDir === 'up' ? "bg-blue-500 w-3/4" : "bg-red-400 w-1/2")}></div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubHospitals = onSnapshot(collection(db, 'hospitals'), (snap) => {
      setHospitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Hospital)));
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'doctor')), (snap) => {
      setDoctors(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setLoading(false);
    });

    return () => {
      unsubHospitals();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h1>
          <p className="text-slate-500 mt-1">Global health management for Malawi.</p>
        </div>
        <button className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus size={20} />
          Add Center
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStat icon={HospitalIcon} label="Health Centers" value={hospitals.length || "4"} trend="+1" trendDir="up" />
        <AdminStat icon={Users} label="Registered Doctors" value={doctors.length || "12"} trend="+4" trendDir="up" />
        <AdminStat icon={Activity} label="Patients Served" value="1,240" trend="+24%" trendDir="up" />
        <AdminStat icon={Clock} label="Avg Wait System-wide" value="18m" trend="-15%" trendDir="down" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Hospital Registry</h2>
              <button className="text-brand-primary font-bold text-sm hover:underline">View Map</button>
            </div>
            <div className="divide-y divide-slate-50">
              {hospitals.map(hospital => (
                <div key={hospital.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center">
                      <HospitalIcon size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{hospital.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin size={14} /> {hospital.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Operational</span>
                    </div>
                    <button className="p-3 text-slate-300 hover:text-slate-600">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <BarChart3 size={180} />
            </div>
            <div className="flex-1 relative z-10">
              <h2 className="text-3xl font-bold mb-4">Export Analytics</h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Download comprehensive health reports, queue efficiency metrics, and clinic performance data for Ministry of Health review.
              </p>
            </div>
             <button className="relative z-10 px-8 py-5 bg-white text-slate-900 rounded-2xl font-black flex items-center gap-3 hover:bg-brand-primary hover:text-white transition-all shadow-xl">
              Generate Report
              <ArrowRight size={20} />
            </button>
          </section>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">Top Doctors</h3>
              <Settings size={20} className="text-slate-300 pointer-events-none" />
            </div>
            <div className="space-y-6">
              {doctors.slice(0, 4).map(doctor => (
                <div key={doctor.uid} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase">
                    {doctor.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{doctor.fullName}</p>
                    <p className="text-xs text-slate-500">24 Consultation today</p>
                  </div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              ))}
              {doctors.length === 0 && <p className="text-slate-400 text-sm italic">No doctors currently active</p>}
            </div>
             <button className="w-full mt-10 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">
                Registry Management
              </button>
          </div>

          <div className="bg-brand-primary/10 border border-brand-primary/20 p-8 rounded-[2.5rem]">
            <h4 className="font-bold text-brand-primary mb-3">System Health</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Database Sync</span>
                <span className="text-emerald-600 font-bold">100%</span>
              </div>
              <div className="w-full h-1.5 bg-brand-primary/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-brand-primary" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">SMS Gateway</span>
                <span className="text-emerald-600 font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

