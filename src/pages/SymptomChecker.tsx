import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Activity,
  HeartPulse,
  Thermometer,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Question {
  id: string;
  question: string;
  type: 'choice' | 'scale' | 'boolean';
  options?: string[];
}

const questions: Question[] = [
  { id: 'fever', question: "Do you have a fever higher than 38°C?", type: 'boolean' },
  { id: 'cough', question: "Are you experiencing a persistent cough?", type: 'boolean' },
  { id: 'breathing', question: "Are you having difficulty breathing or chest pain?", type: 'boolean' },
  { id: 'fatigue', question: "How would you rate your level of fatigue or weakness?", type: 'scale' },
  { id: 'duration', question: "How long have you had these symptoms?", type: 'choice', options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"] },
];

export default function SymptomChecker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<'Emergency' | 'Urgent' | 'Non-urgent' | null>(null);
  const navigate = useNavigate();

  const handleAnswer = (val: any) => {
    const newAnswers = { ...answers, [questions[step].id]: val };
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: any) => {
    let score = 0;
    if (finalAnswers.breathing === true) {
      setResult('Emergency');
      return;
    }
    
    if (finalAnswers.fever === true) score += 2;
    if (finalAnswers.cough === true) score += 1;
    if (finalAnswers.duration === "More than a week") score += 1;
    
    if (score >= 3) setResult('Urgent');
    else setResult('Non-urgent');
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {!result ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Symptom Checker</h1>
              <p className="text-slate-500 mt-1">Answer a few questions for a health recommendation.</p>
            </div>
            <div className="bg-blue-50 text-brand-primary px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm">
              <Stethoscope size={18} />
              Pre-Consultation
            </div>
          </div>

          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-brand-primary"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100 min-h-[400px] flex flex-col"
            >
              <div className="flex-1">
                <span className="text-brand-primary font-bold text-sm uppercase tracking-widest mb-4 block">Question {step + 1} of {questions.length}</span>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">{questions[step].question}</h2>

                <div className="space-y-4">
                  {questions[step].type === 'boolean' && (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleAnswer(true)}
                        className="py-6 border-2 border-slate-100 rounded-2xl text-lg font-bold hover:border-brand-primary hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                      >
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        Yes
                      </button>
                      <button 
                        onClick={() => handleAnswer(false)}
                        className="py-6 border-2 border-slate-100 rounded-2xl text-lg font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center gap-2"
                      >
                        <AlertCircle size={24} className="text-red-400" />
                        No
                      </button>
                    </div>
                  )}

                  {questions[step].type === 'choice' && (
                    <div className="grid grid-cols-1 gap-3">
                      {questions[step].options?.map(opt => (
                        <button 
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className="p-5 border-2 border-slate-100 rounded-2xl text-left font-semibold hover:border-brand-primary hover:bg-blue-50 transition-all flex items-center justify-between group"
                        >
                          {opt}
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-brand-primary" />
                        </button>
                      ))}
                    </div>
                  )}

                  {questions[step].type === 'scale' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-5 gap-2">
                        {[1,2,3,4,5].map(num => (
                          <button 
                            key={num}
                            onClick={() => handleAnswer(num)}
                            className="aspect-square border-2 border-slate-100 rounded-2xl text-xl font-bold flex items-center justify-center hover:border-brand-primary hover:bg-blue-50 transition-all"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-12 flex items-center gap-4">
                {step > 0 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="bg-blue-50 p-6 rounded-3xl flex gap-4">
            <Info className="text-brand-primary shrink-0" size={24} />
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong>Note:</strong> This tool provides recommendations based on your input. It is NOT a medical diagnosis. If you feel very unwell, please seek professional medical help immediately.
            </p>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-3xl p-10 lg:p-16 shadow-xl border border-slate-100 text-center space-y-8">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg",
              result === 'Emergency' ? "bg-red-100 text-red-600" : 
              result === 'Urgent' ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
            )}>
              {result === 'Emergency' ? <AlertCircle size={48} /> : 
               result === 'Urgent' ? <Activity size={48} /> : <CheckCircle2 size={48} />}
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Recommendation</h2>
              <h3 className={cn(
                "text-4xl font-extrabold tracking-tight",
                result === 'Emergency' ? "text-red-600" : 
                result === 'Urgent' ? "text-orange-600" : "text-emerald-600"
              )}>
                {result === 'Emergency' ? "Immediate Attention" : 
                 result === 'Urgent' ? "Same-Day Appointment" : "Routine Consultation"}
              </h3>
            </div>

            <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
              {result === 'Emergency' ? "Please visit the nearest emergency department immediately or call emergency services." : 
               result === 'Urgent' ? "We recommend booking an appointment for today. Your symptoms suggest you should be seen soon." : 
               "Your symptoms appear non-urgent. You can book a regular appointment or rest at home."}
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/book-appointment', { state: { category: result } })}
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-brand-primary/20 transition-all"
              >
                Book Appointment
                <Calendar size={20} />
              </button>
              <button 
                onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                Restart Test
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 text-left">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <HeartPulse size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">Check Vital Signs</p>
                <p className="text-sm text-slate-500">Monitor your heart rate and body temperature regularly.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 text-left">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Thermometer size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">Stay Warm & Hydrated</p>
                <p className="text-sm text-slate-500">Rest is the most important part of recovery for minor illnesses.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
