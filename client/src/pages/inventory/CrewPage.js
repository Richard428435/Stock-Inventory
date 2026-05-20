import React, { useState, useRef, useEffect } from 'react';
import { Camera, Radio, MonitorPlay, Settings2, ShieldCheck, Zap, Activity, Users, Video, Mic, Monitor, Upload, Plus, X } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'J Ryan Elijah',
    role: 'Director of CFFA Media and Broadcasting',
    team: 'EXECUTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    iconName: 'MonitorPlay'
  },
  {
    id: 2,
    name: 'Rohan Williams',
    role: 'Lead Video Production',
    team: 'VIDEO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    iconName: 'Video'
  },
  {
    id: 3,
    name: 'Kevin George',
    role: 'Lead Audio Production',
    team: 'AUDIO',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    iconName: 'Settings2'
  },
  {
    id: 4,
    name: 'Richard Impranch',
    role: 'Lead Presentation',
    team: 'PRESENTATION',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    iconName: 'Monitor'
  },
  {
    id: 5,
    name: 'Dhaveethu Raja',
    role: 'Lead Live Production',
    team: 'BROADCAST',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    iconName: 'Radio'
  }
];

const getIcon = (name) => {
  switch (name) {
    case 'MonitorPlay': return <MonitorPlay className="w-6 h-6" />;
    case 'Video': return <Video className="w-6 h-6" />;
    case 'Settings2': return <Settings2 className="w-6 h-6" />;
    case 'Monitor': return <Monitor className="w-6 h-6" />;
    case 'Radio': return <Radio className="w-6 h-6" />;
    case 'Zap': return <Zap className="w-6 h-6" />;
    default: return <Users className="w-6 h-6" />;
  }
};

export default function CrewPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  // Persist crew to localStorage so additions are saved
  const [teamState, setTeamState] = useState(() => {
    const saved = localStorage.getItem('cffa_crew_roster');
    return saved ? JSON.parse(saved) : TEAM_MEMBERS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', team: 'VIDEO' });
  const fileInputRef = useRef(null);
  const [activeUploadId, setActiveUploadId] = useState(null);

  useEffect(() => {
    localStorage.setItem('cffa_crew_roster', JSON.stringify(teamState));
  }, [teamState]);

  const handleImageClick = (id) => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && activeUploadId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setTeamState(prev => prev.map(m => m.id === activeUploadId ? { ...m, avatar: base64String } : m));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const newId = teamState.length > 0 ? Math.max(...teamState.map(m => m.id)) + 1 : 1;
    let iconName = 'Video';
    if (newMember.team === 'AUDIO') iconName = 'Settings2';
    if (newMember.team === 'PRESENTATION') iconName = 'Monitor';
    if (newMember.team === 'BROADCAST') iconName = 'Radio';
    if (newMember.team === 'LIGHTING') iconName = 'Zap';

    const memberData = {
      id: newId,
      name: newMember.name,
      role: newMember.role,
      team: newMember.team,
      avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop', // Default placeholder
      iconName: iconName
    };

    setTeamState([...teamState, memberData]);
    setShowAddModal(false);
    setNewMember({ name: '', role: '', team: 'VIDEO' });
  };

  return (
    <>
      <div className="space-y-8 pb-20 fade-in h-full flex flex-col">
      {/* Epic Hero Banner for Group Photo */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-slide-up group shrink-0">
        <img 
          src="/media-team.jpg" 
          alt="CFFA Media Team Group" 
          className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop'; // Fallback
          }}
        />
        {/* Gradients to blend text */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent"></div>

        {/* Header Content overlaying the image */}
        <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16 flex flex-col md:flex-row justify-between items-end md:items-center w-[calc(100%-80px)] gap-6">
          <div className="animate-slide-right delay-300">
            <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter leading-none mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
              The <span className="text-[#c49a5b] italic">Crew</span>
            </h2>
            <p className="text-white/70 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold drop-shadow-md">
              CFFA Media & Broadcasting Official Roster
            </p>
          </div>
          
          <div className="flex items-center gap-4 animate-slide-left delay-300">
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-[#d1a66a] to-[#b78645] text-[#1a1a1a] rounded-2xl flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(196,154,91,0.4)] hover:shadow-[0_0_30px_rgba(196,154,91,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
            <div className="hidden md:flex px-5 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl items-center gap-3 shadow-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Live Operations Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
         {['ALL', 'EXECUTIVE', 'VIDEO', 'AUDIO', 'PRESENTATION', 'BROADCAST'].map(f => (
           <button 
             key={f}
             onClick={() => setActiveFilter(f)}
             className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-[#c49a5b] text-[#111]' : 'text-white/40 hover:text-white/80'}`}
           >
             {f}
           </button>
         ))}
      </div>

      {/* Hidden File Input for Avatar Uploads */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {teamState.filter(m => activeFilter === 'ALL' || m.team === activeFilter).map((member, idx) => (
          <div 
            key={member.id} 
            className="group relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[3rem] hover:border-[#c49a5b]/30 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(196,154,91,0.2)] animate-slide-up overflow-hidden flex flex-col"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>

            {/* Large Profile Picture */}
            <div 
              className="relative w-full h-[400px] overflow-hidden z-10 cursor-pointer group/image"
              onClick={() => handleImageClick(member.id)}
            >
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
              
              {/* Upload Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#c49a5b]/20 border border-[#c49a5b]/50 text-[#c49a5b] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(196,154,91,0.5)] animate-pulse">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c49a5b]">Change Portrait</span>
              </div>
              
              {/* Icon floating on image */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md flex items-center justify-center text-[#c49a5b] border border-white/10 shadow-2xl">
                {getIcon(member.iconName)}
              </div>
            </div>

            {/* Crew Details */}
            <div className="relative z-10 p-8 pt-0 flex-1 flex flex-col -mt-12">
              <span className="self-start px-4 py-1.5 rounded-full bg-[#c49a5b] text-[#111] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg mb-4">
                {member.team} TEAM
              </span>
              
              <h3 className="text-3xl font-serif text-white mb-2 leading-tight drop-shadow-md">{member.name}</h3>
              <p className="text-[#c49a5b] text-xs uppercase tracking-[0.2em] font-bold leading-relaxed">{member.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Media Production Readiness Module */}
      <div className="mt-12 bg-gradient-to-br from-[#111111] to-[#0a0a0a] rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden animate-slide-up delay-300">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop')] opacity-5 mix-blend-screen bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-serif text-white mb-2">Livestream Readiness</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">AI Service Preparation Assistant</p>
            
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Network Ping</div>
                  <div className="text-[9px] text-emerald-400 uppercase tracking-widest">12ms • Stable</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">ATEM Sync</div>
                  <div className="text-[9px] text-amber-400 uppercase tracking-widest">Awaiting Inputs</div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] flex items-center gap-3">
            <Radio className="w-4 h-4 animate-pulse" />
            Go Live
          </button>
        </div>
      </div>

      </div>

      {/* Add Member Modal - Rendered OUTSIDE transformed container */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-slide-up relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-3xl font-serif text-white mb-2">Add Teammate</h3>
            <p className="text-[#c49a5b] text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Expand The CFFA Crew</p>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#c49a5b]/50 focus:ring-1 focus:ring-[#c49a5b]/50 transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Role Title</label>
                <input 
                  type="text" 
                  required
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#c49a5b]/50 focus:ring-1 focus:ring-[#c49a5b]/50 transition-all"
                  placeholder="e.g. Camera Operator"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Department</label>
                <select 
                  value={newMember.team}
                  onChange={e => setNewMember({...newMember, team: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c49a5b]/50 focus:ring-1 focus:ring-[#c49a5b]/50 transition-all"
                >
                  <option value="VIDEO">Video Production</option>
                  <option value="AUDIO">Audio Production</option>
                  <option value="PRESENTATION">Presentation</option>
                  <option value="BROADCAST">Broadcast</option>
                  <option value="LIGHTING">Lighting</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-4 bg-gradient-to-r from-[#d1a66a] to-[#b78645] text-[#1a1a1a] rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(196,154,91,0.3)] hover:shadow-[0_0_30px_rgba(196,154,91,0.5)] transition-all"
              >
                Add To Roster
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
