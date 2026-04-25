import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Force change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);

  const [view, setView] = useState('login'); // 'login', 'choice', 'register', 'force-password-change'
  const [selectedRole, setSelectedRole] = useState('user');
  const [name, setName] = useState('');

  const { login, register, forceChangePassword } = useAuth();
  const { config } = useSystem();
  
  const navigate = useNavigate();

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const versesList = config?.loginVerses?.length > 0 ? config.loginVerses : [
    '"So those who received his word were baptized, and the Lord added to their number day by day those who were being saved." Acts 2:41,47',
    '"Take a census of all the congregation of Israel, from twenty years old and upward, by their clans..." Numbers 1:2-3',
    '"Obey your leaders and submit to them, for they are keeping watch over your souls..." Hebrews 13:17',
    '"Pay careful attention to yourselves and to all the flock, in which the Holy Spirit has made you overseers..." Acts 20:28',
    '"Then my God put into my heart to assemble the nobles... and I found the book of the genealogy." Nehemiah 7:5',
    '"Then those who feared the Lord spoke with one another. The Lord paid attention and heard them..." Malachi 3:16'
  ];

  // Auto rotate verses
  useEffect(() => {
    const timer = setInterval(() => {
      setVerseIndex((prev) => (prev + 1) % versesList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [versesList.length]);

  const [regSuccessUser, setRegSuccessUser] = useState(null);

  // Submit Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(name, email, password, selectedRole);
      
      if (result.pending) {
        toast.success('Registration successful. Please wait for administrator approval.', { duration: 6000 });
        setView('login');
      } else {
        toast.success('Account created successfully');
        setRegSuccessUser(result.user);
        setView('success');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      
      // Intercept if temporary password forces change
      if (res && res.requiresPasswordChange) {
        toast.error(res.message, { icon: '🔒', duration: 5000 });
        setView('force-password-change');
        return;
      }
      
      toast.success('Welcome back!');
    } catch (err) {
      console.error('Full Login Error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please check your database connection.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async (e) => {
    e.preventDefault();
    if(newPassword !== confirmNewPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await forceChangePassword(email, password, newPassword);
      toast.success('Password updated successfully! Welcome to the system.', { icon: '🛡️', duration: 4000 });
      navigate('/');
    } catch (err) {
       toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

        {/* Bible verses - left bottom - rotating */}
        <div className="absolute bottom-24 left-8 text-sm md:text-base lg:text-lg xl:text-xl text-white/90 max-w-2xl whitespace-nowrap verse-font fade-in drop-shadow-lg hidden md:block">
          {versesList[verseIndex]}
        </div>

        {/* Copyright - center bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/50 text-center font-serif">
          <div>© {new Date().getFullYear()} {config?.churchName || 'Chariot of Fire Faith Assembly'}</div>
        </div>

        {/* Right-aligned Single Container */}
        <div className="w-full flex justify-center lg:justify-end md:pr-10 lg:pr-24 xl:pr-36 items-center h-screen px-2">
          <div className="glass-liquid bg-white/60 dark:bg-white/5 backdrop-blur-3xl border border-slate-300 dark:border-white/20 rounded-3xl shadow-2xl w-[400px] md:w-[440px] lg:w-[480px] p-8 md:p-10 text-center min-h-[520px] max-h-[90vh] flex flex-col justify-center">
            
            {view === 'login' && (
              <div className="fade-in space-y-6">
                <img
                  src={config?.logoUrl || "/pictures/Logoo_02-removebg-preview.png"}
                  alt="Organization Logo"
                  className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] object-cover rounded-2xl mx-auto mb-4 drop-shadow-2xl brightness-110"
                />
                <div className="space-y-1">
                  <h2 className="text-slate-800 dark:text-white text-3xl font-bold">{getGreeting()}</h2>
                  <p className="text-slate-700 dark:text-white/80 font-medium">Welcome Back!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="glass-liquid bg-white dark:bg-white/20 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">✉️</span>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full bg-transparent text-slate-800 dark:text-gray-100 placeholder-slate-500 dark:placeholder-gray-400 outline-none border-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="glass-liquid bg-white dark:bg-white/20 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3 group relative">
                    <span className="text-xl">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full bg-transparent text-slate-800 dark:text-gray-100 placeholder-slate-500 dark:placeholder-gray-400 outline-none border-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="opacity-40 hover:opacity-100 transition-opacity outline-none pr-1"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-liquid bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 backdrop-blur-xl border border-slate-300 dark:border-white/30 rounded-2xl font-bold text-xl text-slate-800 dark:text-white/90 shadow-2xl transition-all duration-300 px-8 py-4 w-full mt-2"
                  >
                    {loading ? 'Signing in...' : 'Login'}
                  </button>
                </form>
              </div>
            )}

            {view === 'force-password-change' && (
              <div className="fade-in space-y-6">
                <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center text-3xl mb-2 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative">
                  <span className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-50"></span>
                  🔒
                </div>
                <div className="space-y-2">
                  <h2 className="text-slate-800 dark:text-white text-2xl font-bold">Mandatory Update</h2>
                  <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                    Your administrator has provisioned this account with a temporary password. You must secure it with a permanent password to access the system.
                  </p>
                </div>
                
                <form onSubmit={handleForcePasswordChange} className="space-y-4 pt-2">
                  <div className="glass-liquid bg-white dark:bg-white/20 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">🔑</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Permanent Password"
                      className="w-full bg-transparent text-slate-800 dark:text-gray-100 placeholder-slate-500 dark:placeholder-gray-400 outline-none border-none"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="glass-liquid bg-white dark:bg-white/20 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="w-full bg-transparent text-slate-800 dark:text-gray-100 placeholder-slate-500 dark:placeholder-gray-400 outline-none border-none"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end pr-2 opacity-80">
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] font-bold text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors shadow-sm">
                       {showPassword ? "Hide Passwords" : "Show Passwords"}
                     </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-liquid bg-amber-500/90 hover:bg-amber-500 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 backdrop-blur-xl border border-amber-600/30 dark:border-amber-400/30 rounded-2xl font-bold text-[15px] text-white shadow-2xl transition-all duration-300 px-8 py-4 w-full mt-2"
                  >
                    {loading ? 'Securing Account...' : 'Set Permanent Password'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}