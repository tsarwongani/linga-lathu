import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useParams } from 'react-router-dom';
import { QueueEntry } from '../types';
import { 
  Users, 
  Activity, 
  Volume2, 
  Clock, 
  ChevronRight,
  Monitor,
  HeartPulse,
  Info,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function QueueDisplay() {
  const { hospitalId } = useParams();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [hospitalName, setHospitalName] = useState("Linga Lathu Health");
  const [loading, setLoading] = useState(true);

  // For demo, if hospitalId is 'main' or undefined, use a static ID
  const targetId = hospitalId && hospitalId !== 'main' ? hospitalId : "demo-hospital-id";

  useEffect(() => {
    // Listen to queue
    const q = query(
      collection(db, 'hospitals', targetId, 'queue'),
      where('status', 'in', ['waiting', 'calling', 'serving']),
      orderBy('queueNumber', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setQueue(snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueEntry)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId]);

  const currentlyServing = queue.filter(e => e.status === 'serving');
  const beingCalled = queue.filter(e => e.status === 'calling');
  const waiting = queue.filter(e => e.status === 'waiting').slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-6 lg:p-12 selection:bg-blue-600 selection:text-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-6rem)]">
        
        {/* Left Side: Header and Main Display */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <header className="flex items-center justify-between bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 transition-transform group-hover:scale-105">
                <Activity size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">{hospitalName}</h1>
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2">Digital Queue Intelligence System</p>
              </div>
            </div>
            <div className="hidden md:block text-right relative z-10">
              <p className="text-5xl font-mono font-black text-white italic tracking-tighter">{format(new Date(), 'HH:mm')}</p>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
          </header>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Now Serving */}
            <div className="bg-emerald-600 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-900/40 relative overflow-hidden group border-4 border-emerald-500/20">
              <div className="absolute -top-10 -right-10 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Volume2 size={240} />
              </div>
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                <p className="text-emerald-50 font-black uppercase tracking-[0.5em] text-xs">Now Serving</p>
              </div>
              <AnimatePresence mode="wait">
                {currentlyServing.length > 0 ? (
                  currentlyServing.map(e => (
                    <motion.div 
                      key={e.id}
                      initial={{ opacity: 0, scale: 0.5, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="relative z-10"
                    >
                      <h2 className="text-[14rem] leading-[0.8] font-black text-white italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">{e.queueNumber}</h2>
                      <p className="text-2xl font-black text-white mt-12 uppercase tracking-[0.1em] bg-black/20 px-8 py-3 rounded-2xl backdrop-blur-md">{e.patientName}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                    <p className="text-7xl font-black text-emerald-100/30 italic">WAITING</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Calling Next */}
            <div className="bg-blue-600 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-900/40 relative overflow-hidden group border-4 border-blue-500/20">
               <div className="absolute -top-10 -right-10 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Bell size={240} />
              </div>
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <p className="text-blue-50 font-black uppercase tracking-[0.5em] text-xs">Signal Next</p>
              </div>
              <AnimatePresence mode="wait">
                {beingCalled.length > 0 ? (
                  beingCalled.map(e => (
                    <motion.div 
                      key={e.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="relative z-10"
                    >
                      <h2 className="text-[14rem] leading-[0.8] font-black text-white italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-pulse">{e.queueNumber}</h2>
                      <p className="text-2xl font-black text-white mt-12 uppercase tracking-[0.1em] bg-white/10 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/10">{e.patientName}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                    <p className="text-7xl font-black text-blue-100/30 italic uppercase">Signal Ready</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Waiting List */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">Up Next</h2>
              <div className="bg-slate-800 px-5 py-2 rounded-2xl flex items-center gap-3 border border-slate-700">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Live Traffic</span>
              </div>
            </div>

            <div className="flex-1 space-y-5 relative z-10">
              {waiting.length > 0 ? (
                waiting.map((e, idx) => (
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                    key={e.id} 
                    className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-[2rem] flex items-center gap-8 hover:bg-slate-800 hover:border-blue-500/30 transition-all border-l-8 border-l-blue-600 shadow-lg"
                  >
                    <div className="w-20 h-20 bg-slate-700/50 border border-slate-600 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">NO.</span>
                      <span className="text-3xl font-black text-white italic leading-none">{e.queueNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-black text-white truncate tracking-tight uppercase leading-none">{e.patientName}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 py-1 bg-slate-950 rounded-lg border border-slate-700">Waiting</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                  <Monitor size={120} className="mb-6" />
                  <p className="text-3xl font-black uppercase tracking-[0.5em]">Empty Queue</p>
                </div>
              )}
            </div>

            <div className="mt-10 p-8 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/20 relative group overflow-hidden">
              <div className="flex items-center gap-5 mb-4 relative z-10">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
                  <Info size={24} />
                </div>
                <p className="font-black text-white text-xl tracking-tight uppercase italic">Notice</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">
                Arrival coordinates synchronized. Please maintain visual contact with this screen.
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
            </div>
          </div>

          <div className="bg-blue-600 border border-blue-500 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl shadow-blue-900/40 group overflow-hidden">
             <div className="flex items-center gap-6 relative z-10 transition-transform group-hover:translate-x-2">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white border border-white/20 backdrop-blur-md">
                <HeartPulse size={32} />
              </div>
              <div>
                <p className="text-blue-100 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Clinic Efficiency</p>
                <p className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Avg 14m / session</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

