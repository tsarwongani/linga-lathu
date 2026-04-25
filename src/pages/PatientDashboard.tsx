import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, addDoc, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Appointment, QueueEntry, Hospital } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Stethoscope,
  ChevronRight,
  Activity,
  History,
  QrCode,
  HeartPulse
} from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeQueueEntry, setActiveQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const testHospitalId = "demo-hospital-id";

  useEffect(() => {
    if (!profile) return;

    // Listen to patient's appointments
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', profile.uid),
      orderBy('date', 'asc')
    );

    const unsubscribeAppts = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
      setLoading(false);
    });

    // Listen to patient's active queue entry
    const qq = query(
      collection(db, 'hospitals', testHospitalId, 'queue'),
      where('patientId', '==', profile.uid),
      where('status', 'in', ['waiting', 'calling', 'serving'])
    );

    const unsubscribeQueue = onSnapshot(qq, (snap) => {
      if (!snap.empty) {
        setActiveQueueEntry({ id: snap.docs[0].id, ...snap.docs[0].data() } as QueueEntry);
      } else {
        setActiveQueueEntry(null);
      }
    });

    return () => {
      unsubscribeAppts();
      unsubscribeQueue();
    };
  }, [profile]);

  const handleCheckIn = async (apt: Appointment) => {
    if (!profile) return;
    
    // 1. Update appointment status
    await updateDoc(doc(db, 'appointments', apt.id), { status: 'checked-in' });
    
    // 2. Add to hospital queue
    // Get next queue number (simple for demo - count current waiting)
    const queueSnap = await getDocs(collection(db, 'hospitals', testHospitalId, 'queue'));
    const nextNum = queueSnap.size + 1;

    await addDoc(collection(db, 'hospitals', testHospitalId, 'queue'), {
      hospitalId: testHospitalId,
      patientId: profile.uid,
      patientName: profile.fullName,
      queueNumber: nextNum,
      status: 'waiting',
      checkInTime: serverTimestamp()
    });
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Health Journey</h1>
          <p className="text-slate-500 mt-1">Manage your appointments and view health status.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20">Current</button>
          <button className="px-6 py-2 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">History</button>
        </div>
      </div>

      {activeQueueEntry && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center gap-12"
        >
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <p className="text-[10px] text-blue-100 font-black uppercase tracking-[0.4em]">Live Queue Hub</p>
            </div>
            <h2 className="text-6xl font-black mb-4 uppercase tracking-tighter italic">Now Serving</h2>
            <p className="text-blue-100/80 text-sm max-w-sm font-medium leading-relaxed">
              Your recovery starts here. Please remain in the waiting area until your number is displayed on the screen.
            </p>
          </div>
          <div className="flex items-center gap-12 bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-md">
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3">My Token</p>
              <div className="text-7xl font-black text-white italic drop-shadow-2xl">
                {activeQueueEntry.queueNumber}
              </div>
            </div>
            <div className="h-24 w-px bg-white/20 hidden sm:block" />
            <div className="text-center hidden sm:block">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3">Status</p>
              <div className="px-5 py-2.5 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px]">
                {activeQueueEntry.status}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-brand-primary rounded-xl">
                  <Calendar size={20} />
                </div>
                Upcoming Appointments
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center bg-slate-50 w-20 h-20 rounded-[1.5rem] border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{format(new Date(apt.date), 'MMM')}</span>
                          <span className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-all leading-none">{format(new Date(apt.date), 'dd')}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight">Lilongwe Central Hospital</p>
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-blue-600" /> {apt.timeSlot}</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <span className="flex items-center gap-1.5"><Activity size={12} className="text-emerald-500" /> {apt.symptomCategory} priority</span>
                          </div>
                        </div>
                      </div>
                      
                      {isToday(new Date(apt.date)) ? (
                        <button 
                          onClick={() => handleCheckIn(apt)}
                          disabled={!!activeQueueEntry}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                        >
                          Check In Now
                          <QrCode size={18} />
                        </button>
                      ) : (
                        <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                          Manage
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">No upcoming appointments.</p>
                  <p className="text-sm text-slate-400 mt-1">Time for a routine checkup?</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                  <History size={20} />
                </div>
                Recent Visit History
              </h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
               {pastAppointments.length > 0 ? (
                pastAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{format(new Date(apt.date), 'MMMM dd, yyyy')}</p>
                        <p className="text-sm text-slate-500">General Consultation • Dr. Phiri</p>
                      </div>
                    </div>
                    <button className="text-brand-primary text-sm font-bold hover:underline">View Notes</button>
                  </div>
                ))
               ) : (
                 <div className="p-8 text-center text-slate-400 italic text-sm">
                   No past records available in digital system.
                 </div>
               )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
              <Stethoscope size={150} />
            </div>
            <h3 className="text-2xl font-bold relative z-10 mb-2">Feeling unwell?</h3>
            <p className="text-slate-400 text-sm relative z-10 mb-8 leading-relaxed">
              Use our AI-assisted symptom checker to get a quick health recommendation.
            </p>
            <button 
              onClick={() => navigate('/symptom-checker')}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all relative z-10"
            >
              Start Assessment
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Health Insights</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Physical Activity</p>
                  <p className="font-bold text-slate-900">4,500 Steps Today</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                  <HeartPulse size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Heart Rate</p>
                  <p className="font-bold text-slate-900">72 BPM (Resting)</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Sync Status
                </p>
                <p className="text-emerald-900 text-sm">Health records synced with National Registry.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

