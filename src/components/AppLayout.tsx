import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Activity,
  Menu,
  X,
  Hospital,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "nav-link m-2",
      active ? "nav-link-active" : "nav-link-inactive"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export default function AppLayout() {
  const { profile, signOut, isPatient, isDoctor, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", show: true },
    { to: "/patient", icon: UserIcon, label: "My Health", show: isPatient },
    { to: "/book-appointment", icon: Calendar, label: "Bookings", show: isPatient },
    { to: "/symptom-checker", icon: Stethoscope, label: "Symptom Checker", show: isPatient },
    { to: "/doctor", icon: Activity, label: "Patient Queue", show: isDoctor },
    { to: "/admin", icon: Hospital, label: "Hospital Admin", show: isAdmin },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar sticky top-0 overflow-y-auto">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">L</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Linga Lathu</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Health Queue</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.filter(item => item.show).map((item) => (
            <div key={item.to}>
              <SidebarLink 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to} 
              />
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{profile?.fullName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{profile?.role}</p>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg text-xs font-bold transition-colors"
            >
              Emergency SOS
            </button>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-600 text-sm font-semibold transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="font-bold text-lg text-slate-900">Linga Lathu</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} className="text-slate-600" />
          </button>
        </header>

        <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
                  <h1 className="font-bold text-xl text-slate-900">Linga Lathu</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 mb-2">
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profile?.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-4 py-2">
                {navigation.filter(item => item.show).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all mb-1",
                      location.pathname === item.to ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <item.icon size={22} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={signOut}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-600 font-medium hover:bg-red-50 transition-all"
                >
                  <LogOut size={22} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
