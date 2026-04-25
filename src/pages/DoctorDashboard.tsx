import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, addDoc, getDocs, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { QueueEntry, Appointment, AppointmentStatus, QueueStatus } from '../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Bell, 
  User as UserIcon,
  Phone,
  Stethoscope,
  ChevronRight,
  MoreVertical,
  SkipForward,
  ArrowRight,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const testHospitalId = "demo-hospital-id";

  useEffect(() => {
    if (!profile) return;

    // Listen to queue for the doctor's hospital
    const q = query(
      collection(db, 'hospitals', testHospitalId, 'queue'),
      where('status', 'in', ['waiting', 'calling', 'serving']),
      orderBy('queueNumber', 'asc')
    );

    const unsubscribeQueue = onSnapshot(q, (snap) => {
      setQueue(snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueEntry)));
      setLoading(false);
    });

    // Listen to today's appointments
    const aq = query(
      collection(db, 'appointments'),
      where('hospitalId', '==', testHospitalId),
      where('date', '==', format(new Date(), 'yyyy-MM-dd'))
    );

    const unsubscribeAppointments = onSnapshot(aq, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    return () => {
      unsubscribeQueue();
      unsubscribeAppointments();
    };
  }, [profile]);

  const updateQueueStatus = async (entryId: string, status: QueueStatus) => {
    const docRef = doc(db, 'hospitals', testHospitalId, 'queue', entryId);
    await updateDoc(docRef, { status });
  };

  const completeService = async (entryId: string, patientId: string) => {
    await updateQueueStatus(entryId, 'completed');
    
    // Also update appointment if exists
    const apt = appointments.find(a => a.patientId === patientId && a.status === 'checked-in');
    if (apt) {
      await updateDoc(doc(db, 'appointments', apt.id), { status: 'completed' as AppointmentStatus });
    }
    setSelectedPatient(null);
  };

  const currentlyServing = queue.find(e => e.status === 'serving');
  const beingCalled = queue.find(e => e.status === 'calling');
  const waitingPatients = queue.filter(e => e.status === 'waiting');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Operations</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Managing patient flow for {profile?.fullName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-[1.5rem] border border-slate-200 flex items-center gap-4 pr-6 shadow-sm overflow-hidden relative group">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Queue</p>
              <p className="text-2xl font-black text-slate-900">{queue.length}</p>
            </div>
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Active Consultation Card */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 p-12 opacity-10 pointer-events-none rotate-12 scale-150">
              <Stethoscope size={300} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]" />
                  <p className="text-blue-100 font-black uppercase tracking-[0.4em] text-[10px]">Active Consultation</p>
                </div>
                
                {currentlyServing ? (
                  <div className="flex flex-col md:flex-row md:items-center gap-10">
                    <div className="w-32 h-32 bg-white/20 rounded-[2.5rem] backdrop-blur-xl flex flex-col items-center justify-center border border-white/30 shadow-2xl">
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOKEN</span>
                      <span className="text-5xl font-black italic tracking-tighter leading-none">{currentlyServing.queueNumber}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter leading-tight">{currentlyServing.patientName}</h2>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                          <Clock size={14} className="text-blue-300" /> Arrived {format(currentlyServing.checkInTime.toDate(), 'HH:mm')}
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                          <Activity size={14} className="text-emerald-400" /> {appointments.find(a => a.patientId === currentlyServing.patientId)?.symptomCategory || 'General'} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                ) : beingCalled ? (
                   <div className="flex flex-col md:flex-row md:items-center gap-10">
                    <div className="w-32 h-32 bg-white/20 rounded-[2.5rem] animate-pulse flex flex-col items-center justify-center border border-white/30">
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOKEN</span>
                      <span className="text-5xl font-black italic tracking-tighter">{beingCalled.queueNumber}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-100 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Patient Signaling...</p>
                      <h2 className="text-6xl font-black mb-2 uppercase tracking-tighter italic">Calling</h2>
                      <p className="text-blue-100/60 font-medium">Please wait for user to arrive at consultation desk.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/20 rounded-[2.5rem]">
                    <p className="text-2xl font-black text-white/40 uppercase tracking-widest italic">Consultation Room Empty</p>
                    <p className="text-blue-100/40 text-xs font-bold uppercase tracking-widest mt-2">Ready for next patient signals</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                {currentlyServing && (
                   <button 
                    onClick={() => completeService(currentlyServing.id, currentlyServing.patientId)}
                    className="flex-1 bg-white text-blue-600 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
                  >
                    Complete Session
                    <CheckCircle2 size={20} />
                  </button>
                )}
                {beingCalled && (
                  <button 
                    onClick={() => updateQueueStatus(beingCalled.id, 'serving')}
                    className="flex-1 bg-emerald-500 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
                  >
                    Start Consultation
                    <ArrowRight size={20} />
                  </button>
                )}
                {(!currentlyServing && !beingCalled) && (
                   <button 
                   onClick={() => waitingPatients.length > 0 && updateQueueStatus(waitingPatients[0].id, 'calling')}
                   className="flex-1 bg-white text-blue-600 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
                 >
                   Call Next Patient
                   <Bell size={20} />
                 </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Patient Queue</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((entry) => (
                  <div key={entry.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-all group">
                    <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex flex-col items-center justify-center font-bold group-hover:bg-brand-primary group-hover:text-white transition-all">
                      <span className="text-[10px] uppercase opacity-50">No.</span>
                      <span className="text-xl leading-none">{entry.queueNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-lg">{entry.patientName}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> {format(entry.checkInTime.toDate(), 'HH:mm')}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="capitalize">{appointments.find(a => a.patientId === entry.patientId)?.symptomCategory || 'Normal'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => updateQueueStatus(entry.id, 'calling')}
                        disabled={!!currentlyServing || !!beingCalled}
                        className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-20 transition-all shadow-md shadow-brand-primary/10"
                      >
                        Call Patient
                        <Bell size={18} />
                      </button>
                      <button className="p-3 text-slate-300 hover:text-slate-600 bg-white rounded-xl border border-slate-100">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-400">
                  <Users size={64} className="mx-auto mb-6 opacity-10" />
                  <p className="text-lg font-medium">No patients waiting in queue</p>
                  <p className="text-sm mt-1">Arrivals will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Today's Performance</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-brand-primary rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Serving Speed</p>
                    <p className="text-xs text-slate-500">Avg 12m per patient</p>
                  </div>
                </div>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+14%</span>
              </div>
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-brand-secondary rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Patient Satisfaction</p>
                    <p className="text-xs text-slate-500">4.8/5 based on 40 clinics</p>
                  </div>
                </div>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+2%</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <button className="text-brand-primary font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                View detailed logs
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-8 opacity-20 rotate-12 pointer-events-none">
              <Activity size={100} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Patient Information</p>
            {currentlyServing ? (
              <div className="space-y-4 relative z-10">
                <h4 className="text-xl font-bold text-white">Symptom Summary</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs mb-1">Triage Category</p>
                    <p className="font-bold text-white">
                      {appointments.find(a => a.patientId === currentlyServing.patientId)?.symptomCategory || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs mb-1">Previous Visits</p>
                    <p className="font-bold text-white">3 Visits in 6 Months</p>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
                  Open Patient History
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <p className="text-slate-500 italic mt-2">Select a patient to see history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
