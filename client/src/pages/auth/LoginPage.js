import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import toast from 'react-hot-toast';
import { Shield, Users, BookOpen, Heart } from 'lucide-react';

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
      window.location.href = '/inventory';
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
    <div className="min-h-screen relative overflow-hidden bg-black">
      
      {/* Dedicated Login Background Image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/pictures/luxury_login_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      {/* Optional dark gradient overlay to ensure text contrast over mountains */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

        {/* Giant Watermark Logo */}
        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
          <img src={config?.logoUrl || "/pictures/Logoo_02-removebg-preview.png"} alt="Watermark" className="w-[600px] h-[600px] object-contain" />
        </div>

        {/* Left Side Content Container */}
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full flex flex-col justify-between p-12 md:p-20 lg:p-28 pointer-events-none z-10">
          
          {/* Bible verses - Elegant Epigraph */}
          <div 
            key={verseIndex}
            className="max-w-[90%] lg:max-w-[85%] hidden md:flex flex-col gap-5 animate-slide-right opacity-0"
            style={{ animationFillMode: 'forwards', animationDelay: '300ms' }}
          >
            <div>
              <p className="text-[#eaddcf]/90 font-serif text-lg md:text-xl lg:text-[22px] italic leading-loose tracking-wide drop-shadow-md mb-6 font-light">
                "{versesList[verseIndex].split('"')[1]}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-6 h-[1px] bg-[#c49a5b]"></div>
                <p className="text-[#c49a5b] font-bold uppercase tracking-[0.4em] text-[10px] md:text-[11px]">
                  {versesList[verseIndex].split('"')[2]?.trim() || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Features / Core Values */}
          <div className="hidden lg:grid grid-cols-4 gap-6 max-w-[90%] animate-slide-up opacity-0 mb-8" style={{ animationFillMode: 'forwards', animationDelay: '600ms' }}>
            <div className="flex flex-col items-center text-center gap-4">
              <Shield className="w-7 h-7 text-[#c49a5b]" strokeWidth={1} />
              <h4 className="text-[#eaddcf] font-bold uppercase tracking-[0.2em] text-[8px]">Faithful Stewardship</h4>
              <p className="text-white/40 text-[9px] leading-relaxed">Managing resources<br/>with integrity.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <Users className="w-7 h-7 text-[#c49a5b]" strokeWidth={1} />
              <h4 className="text-[#eaddcf] font-bold uppercase tracking-[0.2em] text-[8px]">Spiritual Unity</h4>
              <p className="text-white/40 text-[9px] leading-relaxed">Working together<br/>in purpose.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <BookOpen className="w-7 h-7 text-[#c49a5b]" strokeWidth={1} />
              <h4 className="text-[#eaddcf] font-bold uppercase tracking-[0.2em] text-[8px]">Divine Purpose</h4>
              <p className="text-white/40 text-[9px] leading-relaxed">Every action for<br/>His glory.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <Heart className="w-7 h-7 text-[#c49a5b]" strokeWidth={1} />
              <h4 className="text-[#eaddcf] font-bold uppercase tracking-[0.2em] text-[8px]">Eternal Impact</h4>
              <p className="text-white/40 text-[9px] leading-relaxed">Building His kingdom<br/>that lasts.</p>
            </div>
          </div>
        </div>

        {/* Right-aligned Single Container */}
        <div className="w-full flex justify-center lg:justify-end lg:pr-[8%] xl:pr-[12%] items-center min-h-screen py-12 px-4 z-20 relative overflow-y-auto">
          {/* Right Card with custom border highlight */}
          <div className="relative w-full max-w-[420px] md:max-w-[440px] animate-slide-up group">
            
            {/* The elegant top-right edge highlight */}
            <div className="absolute -inset-[1px] bg-gradient-to-tr from-transparent via-white/5 to-[#eaddcf]/80 rounded-[2.5rem] opacity-100 pointer-events-none" style={{ maskImage: 'linear-gradient(225deg, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(225deg, black 0%, transparent 40%)' }}></div>
            <div className="absolute -inset-[1px] border border-white/5 rounded-[2.5rem] pointer-events-none"></div>

            <div className="bg-[#0a0a0a]/80 backdrop-blur-lg rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] w-full p-10 sm:p-12 text-center flex flex-col justify-center my-auto relative overflow-hidden">
              
              {/* Subtle inner noise/texture (Optimized) */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'1\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
              
              {view === 'login' && (
                <div className="relative z-10 space-y-10">
                  <div className="flex justify-center items-center h-[120px] mb-6">
                    <img
                      src={config?.logoUrl || "/pictures/Logoo_02-removebg-preview.png"}
                      alt="Organization Logo"
                      className="w-[120px] h-[120px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-float-lux delay-100"
                    />
                  </div>
                  <div className="space-y-4 animate-slide-right delay-200">
                    <h2 className="text-[40px] leading-none font-serif tracking-tight">
                      <span className="text-white font-normal">Good </span>
                      <span className="text-[#c49a5b] font-normal italic">Evening</span>
                    </h2>
                    <p className="text-white/40 font-semibold uppercase tracking-[0.4em] text-[8px] mt-2">Welcome Back To The Dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-[#161616]/80 border border-[#333333] rounded-2xl px-5 py-4 flex items-center gap-4 focus-within:border-[#c49a5b]/60 transition-all duration-300 animate-slide-up delay-300 group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-focus-within:text-[#c49a5b] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-transparent text-white/90 placeholder-white/20 outline-none border-none font-medium text-[13px]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-[#161616]/80 border border-[#333333] rounded-2xl px-5 py-4 flex items-center gap-4 focus-within:border-[#c49a5b]/60 transition-all duration-300 animate-slide-up delay-400 group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/30 group-focus-within:text-[#c49a5b] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Secure Password"
                        className="w-full bg-transparent text-white/90 placeholder-white/20 outline-none border-none font-medium text-[13px]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="opacity-30 hover:opacity-100 text-white transition-opacity outline-none pr-1"
                      >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-b from-[#d1a66a] to-[#b78645] hover:from-[#e8bd7f] hover:to-[#c49652] rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] text-[#1a1a1a] shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 px-8 py-[18px] w-full mt-6 animate-scale-in delay-500"
                    >
                      {loading ? 'Authenticating...' : 'Sign In To Dashboard'}
                    </button>

                    <div className="pt-8 animate-slide-up delay-700 flex items-center justify-center gap-3 opacity-60">
                      <div className="h-[1px] w-12 bg-white/20"></div>
                      <span className="text-white/40 text-[7px] font-bold uppercase tracking-[0.3em]">Serving His Kingdom Together</span>
                      <div className="h-[1px] w-12 bg-white/20"></div>
                    </div>
                  </form>
                </div>
              )}

            {view === 'force-password-change' && (
              <div className="fade-in space-y-6">
                <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mb-2 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative">
                  <span className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-50"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-slate-800 dark:text-white text-2xl font-bold">Mandatory Update</h2>
                  <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                    Your administrator has provisioned this account with a temporary password. You must secure it with a permanent password to access the system.
                  </p>
                </div>
                
                <form onSubmit={handleForcePasswordChange} className="space-y-4 pt-2">
                  <div className="glass-liquid bg-white dark:bg-white/20 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
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
    </div>
  );
}