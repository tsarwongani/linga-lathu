import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Hospital, AppointmentStatus, SymptomCategory } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Hospital as HospitalIcon, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday } from 'date-fns';
import { cn } from '../lib/utils';

const timeSlots = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM"
];

const mockHospitals: Omit<Hospital, 'id'>[] = [
  { name: "Lilongwe Central Hospital", location: "Lilongwe, Area 3", patientLimitPerDay: 100, workingHours: "08:00 - 17:00" },
  { name: "Blantyre Adventist Hospital", location: "Blantyre, Ginnery Corner", patientLimitPerDay: 50, workingHours: "07:30 - 18:00" },
  { name: "Mzuzu Central Hospital", location: "Mzuzu, Luwinga", patientLimitPerDay: 80, workingHours: "08:00 - 16:30" },
  { name: "Zomba Central Hospital", location: "Zomba, City Center", patientLimitPerDay: 70, workingHours: "08:00 - 17:00" },
];

export default function CreateAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const initialCategory = (location.state as any)?.category as SymptomCategory || 'Non-urgent';

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadHospitals() {
      const snap = await getDocs(collection(db, 'hospitals'));
      if (snap.empty) {
        // Seed if empty for demo
        const batch = mockHospitals.map(h => addDoc(collection(db, 'hospitals'), h));
        await Promise.all(batch);
        const newSnap = await getDocs(collection(db, 'hospitals'));
        setHospitals(newSnap.docs.map(d => ({ id: d.id, ...d.data() } as Hospital)));
      } else {
        setHospitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Hospital)));
      }
    }
    loadHospitals();
  }, []);

  const handleBooking = async () => {
    if (!selectedHospital || !selectedTime || !profile) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: profile.uid,
        hospitalId: selectedHospital.id,
        date: selectedDate,
        timeSlot: selectedTime,
        status: 'scheduled' as AppointmentStatus,
        symptomCategory: initialCategory,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900">Appointment Booked!</h2>
        <p className="text-slate-500 max-w-sm">
          Your appointment at <strong>{selectedHospital?.name}</strong> has been confirmed for {format(new Date(selectedDate), 'MMMM do')} at {selectedTime}.
        </p>
        <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book an Appointment</h1>
          <p className="text-slate-500 mt-1">Select your preferred hospital and time slot.</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-sm font-bold",
          initialCategory === 'Emergency' ? "bg-red-50 text-red-600 border border-red-100" :
          initialCategory === 'Urgent' ? "bg-orange-50 text-orange-600 border border-orange-100" :
          "bg-emerald-50 text-emerald-600 border border-emerald-100"
        )}>
          {initialCategory} Priority
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HospitalIcon size={20} className="text-brand-primary" />
            1. Select Hospital
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {hospitals.map(hospital => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all flex items-start gap-4 text-left",
                  selectedHospital?.id === hospital.id ? "bg-blue-50 border-brand-primary" : "bg-white border-slate-100 hover:border-slate-200"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  selectedHospital?.id === hospital.id ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-400"
                )}>
                  <HospitalIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-bold", selectedHospital?.id === hospital.id ? "text-brand-primary" : "text-slate-900")}>
                    {hospital.name}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {hospital.location}
                  </p>
                </div>
                {selectedHospital?.id === hospital.id && <CheckCircle2 size={20} className="text-brand-primary mt-1" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon size={20} className="text-brand-primary" />
              2. Choose Date
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {dates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "flex-shrink-0 w-20 py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                      isSelected ? "bg-brand-primary border-brand-primary text-white" : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{format(date, 'EEE')}</span>
                    <span className="text-xl font-extrabold">{format(date, 'dd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedHospital && (
             <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-brand-primary" />
                3. Available Slots
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-bold transition-all",
                      selectedTime === time ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center justify-between">
        <div className="hidden sm:block">
          {selectedHospital ? (
            <p className="text-sm text-slate-500">
              Booking for <span className="font-bold text-slate-900">{selectedHospital.name}</span> on <span className="font-bold text-slate-900">{format(new Date(selectedDate), 'MMM dd')}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">Please select a hospital to continue</p>
          )}
        </div>
        <button
          disabled={!selectedHospital || !selectedTime || loading}
          onClick={handleBooking}
          className="w-full sm:w-auto px-10 py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
        >
          {loading ? "Confirming..." : "Confirm Booking"}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
