
import React, { useState, useEffect, useRef } from 'react';
import { 
  Palmtree, 
  Waves, 
  Hotel, 
  Navigation, 
  Users, 
  TrendingUp, 
  Leaf, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Compass,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Zap,
  Coffee,
  Bus,
  Mountain,
  User,
  MessageCircle,
  Star,
  Info,
  Sparkles,
  ArrowBigUp,
  Globe,
  Handshake,
  Gift,
  Trophy
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TourismService, PlayerStats, ServiceSlot, BookingRequest, HistoryData, EconomicEvent, CommunityStats, Peer } from './types';
import { generateTourismShock, getTourismAdvice } from './services/geminiService';

const SERVICE_TIERS: Record<string, Record<number, TourismService>> = {
  lodge: {
    1: { id: 'lodge', name: 'Eco-Lodge Stay', basePrice: 200, durationSeconds: 60, category: 'accommodation', ecoImpact: -2, requirements: { permit: 1 } },
    2: { id: 'lodge', name: 'Luxury Jungle Suite', basePrice: 480, durationSeconds: 60, category: 'accommodation', ecoImpact: -5, requirements: { permit: 1 } },
  },
  zipline: {
    1: { id: 'zipline', name: 'Canopy Zipline', basePrice: 85, durationSeconds: 30, category: 'tour', ecoImpact: -1, requirements: { gear: 1 } },
    2: { id: 'zipline', name: 'Mega-Circuit Zipline', basePrice: 195, durationSeconds: 30, category: 'tour', ecoImpact: -3, requirements: { gear: 1 } },
  },
  coffee: {
    1: { id: 'coffee', name: 'Coffee Farm Tour', basePrice: 45, durationSeconds: 20, category: 'tour', ecoImpact: +2, requirements: { beans: 1 } },
    2: { id: 'coffee', name: 'Organic Roastery Exp', basePrice: 125, durationSeconds: 20, category: 'tour', ecoImpact: +5, requirements: { beans: 1 } },
  },
  shuttle: {
    1: { id: 'shuttle', name: 'Airport Shuttle', basePrice: 120, durationSeconds: 45, category: 'transport', ecoImpact: -3, requirements: { fuel: 1 } },
    2: { id: 'shuttle', name: 'VIP Electric Van', basePrice: 280, durationSeconds: 45, category: 'transport', ecoImpact: +2, requirements: { fuel: 1 } },
  },
};

const UPGRADE_COSTS: Record<string, number> = {
  lodge: 1200,
  zipline: 750,
  coffee: 600,
  shuttle: 900,
};

const INITIAL_PEERS: Peer[] = [
  { id: 'p1', name: 'Student Mateo', avatar: '🎒', score: 2400, ecoScore: 92, contribution: 500 },
  { id: 'p2', name: 'Manager Sofia', avatar: '🌿', score: 1800, ecoScore: 88, contribution: 200 },
  { id: 'p3', name: 'Capitán Diego', avatar: '🛶', score: 3200, ecoScore: 45, contribution: 50 },
  { id: 'p4', name: 'Elena Eco', avatar: '🦋', score: 1500, ecoScore: 98, contribution: 800 },
];

const getServiceIcon = (id: string, size: number = 20) => {
  switch (id) {
    case 'lodge': return <Hotel size={size} />;
    case 'zipline': return <Mountain size={size} />;
    case 'coffee': return <Coffee size={size} />;
    case 'shuttle': return <Bus size={size} />;
    default: return <Navigation size={size} />;
  }
};

export default function App() {
  const [stats, setStats] = useState<PlayerStats>({ 
    money: 1500, 
    ecoScore: 85, 
    reputation: 50, 
    inventory: { gear: 5, permit: 5, beans: 10, fuel: 5 }, 
    upgrades: { lodge: 1, zipline: 1, coffee: 1, shuttle: 1 },
    activeBookings: 0,
    totalDonated: 0
  });

  const [community, setCommunity] = useState<CommunityStats>({
    projectGoal: 10000,
    projectCurrent: 1550,
    globalEcoStatus: 72,
    peers: INITIAL_PEERS
  });

  const [slots, setSlots] = useState<ServiceSlot[]>(Array(6).fill(null).map((_, i) => ({ id: i, serviceId: null, startTime: null, endTime: null, guestName: null })));
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [view, setView] = useState<'operations' | 'requests' | 'assets' | 'analytics' | 'community'>('operations');
  const [mentorSpeech, setMentorSpeech] = useState("¡Pura Vida! Don Carlos here. Don't forget, our Pueblo is building a National Park. Every colon you donate helps our environment!");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [event, setEvent] = useState<EconomicEvent | null>(null);

  const lastEventTime = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      if (now - lastEventTime.current > 45000) {
        triggerGlobalEvent();
        lastEventTime.current = now;
      }
      
      // Simulate peer progress
      if (Math.random() > 0.95) {
        setCommunity(prev => ({
          ...prev,
          projectCurrent: prev.projectCurrent + Math.floor(Math.random() * 50),
          peers: prev.peers.map(p => ({
            ...p,
            score: p.score + Math.floor(Math.random() * 20),
            contribution: p.contribution + (Math.random() > 0.8 ? 10 : 0)
          }))
        }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [stats]);

  useEffect(() => {
    generateNewRequests();
  }, []);

  const triggerGlobalEvent = async () => {
    const newEvent = await generateTourismShock(stats);
    setEvent(newEvent);
    setMentorSpeech(newEvent.description);
    if (newEvent.concept.toLowerCase().includes('negative')) {
      setStats(prev => ({ ...prev, ecoScore: Math.max(0, prev.ecoScore - 5) }));
    }
  };

  const generateNewRequests = () => {
    const names = ["The Miller Family", "Backpacker Ben", "Gourmet Travelers", "Adventure Squad"];
    const newReqs: BookingRequest[] = names.map((name, i) => {
      const randomServiceId = Object.keys(SERVICE_TIERS)[Math.floor(Math.random() * 4)];
      const currentLevel = stats.upgrades[randomServiceId] || 1;
      const service = SERVICE_TIERS[randomServiceId][currentLevel];
      
      return {
        id: `b-${i}-${Date.now()}`,
        groupName: name,
        servicesNeeded: { [randomServiceId]: 1 + Math.floor(Math.random() * 2) },
        totalPay: service.basePrice * (1 + Math.random() * 0.5),
        urgency: Math.random() > 0.5 ? 'high' : 'low'
      };
    });
    setBookings(newReqs);
  };

  const startService = async (slotId: number, serviceId: string, guestName: string = "Walk-in Guest") => {
    const currentLevel = stats.upgrades[serviceId] || 1;
    const service = SERVICE_TIERS[serviceId][currentLevel];
    if (!service) return;

    for (const [item, qty] of Object.entries(service.requirements)) {
      if ((stats.inventory[item] || 0) < qty) {
        setMentorSpeech(`¡Ay caramba! We're out of ${item}. Ask a classmate for a gift or restock!`);
        return;
      }
    }

    setStats(prev => {
      const newInv = { ...prev.inventory };
      Object.entries(service.requirements).forEach(([item, qty]) => newInv[item] -= qty);
      return { ...prev, inventory: newInv };
    });

    setSlots(prev => prev.map(s => s.id === slotId ? {
      ...s,
      serviceId,
      guestName,
      startTime: Date.now(),
      endTime: Date.now() + (service.durationSeconds * 1000)
    } : s));

    const advice = await getTourismAdvice(`Started ${service.name} (Tier ${currentLevel}) for ${guestName}`, stats);
    setMentorSpeech(advice);
  };

  const finishService = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.serviceId || !slot.endTime || currentTime < slot.endTime) return;

    const currentLevel = stats.upgrades[slot.serviceId] || 1;
    const service = SERVICE_TIERS[slot.serviceId][currentLevel];
    
    setStats(prev => {
      const earned = service.basePrice;
      const newHistory = [...history, { time: new Date().toLocaleTimeString(), revenue: earned, ecoScore: prev.ecoScore }].slice(-20);
      setHistory(newHistory);
      return {
        ...prev,
        money: prev.money + earned,
        ecoScore: Math.min(100, Math.max(0, prev.ecoScore + service.ecoImpact)),
        reputation: Math.min(100, prev.reputation + 2)
      };
    });

    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, serviceId: null, startTime: null, endTime: null, guestName: null } : s));
  };

  const handleDonate = (amount: number) => {
    if (stats.money < amount) return;
    setStats(prev => ({ ...prev, money: prev.money - amount, totalDonated: prev.totalDonated + amount }));
    setCommunity(prev => ({ ...prev, projectCurrent: prev.projectCurrent + amount }));
    setMentorSpeech(`¡Excelente! Donating ${amount} to the National Park fund. You're a true Pura Vida leader!`);
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-amber-200">
      {/* Sidebar */}
      <nav className="w-full md:w-80 bg-[#4CAF50] text-white flex flex-col shadow-[10px_0_0_0_rgba(0,0,0,0.1)] z-30 overflow-hidden relative border-r-8 border-emerald-700">
        <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12">
          <Palmtree size={160} />
        </div>
        
        <div className="p-6 relative">
          <div className="bg-emerald-800/40 p-4 rounded-3xl border-4 border-emerald-300 shadow-xl mb-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center text-emerald-900 shadow-inner">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black italic">Manager Gaby</h2>
              <div className="flex items-center gap-1 text-amber-200">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-widest">Master Host</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="text-amber-300 drop-shadow-lg" size={28} />
            <h1 className="text-2xl font-black tracking-tighter italic text-white drop-shadow-[2px_2px_0px_#065f46]">PuraVida <span className="text-amber-300">EXP</span></h1>
          </div>
        </div>

        <div className="px-4 space-y-3 flex-1">
          <SidebarLink active={view === 'operations'} onClick={() => setView('operations')} icon={<Navigation />} label="My Tours" />
          <SidebarLink active={view === 'requests'} onClick={() => setView('requests')} icon={<Users />} label="New Guests" />
          <SidebarLink active={view === 'assets'} onClick={() => setView('assets')} icon={<Briefcase />} label="Shed & Upgrades" />
          <SidebarLink active={view === 'community'} onClick={() => setView('community')} icon={<Globe />} label="The Pueblo" />
          <SidebarLink active={view === 'analytics'} onClick={() => setView('analytics')} icon={<TrendingUp />} label="The Ledger" />
        </div>

        <div className="p-6 bg-emerald-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]">
          <div className="bg-amber-100 p-4 rounded-3xl border-4 border-amber-300 shadow-lg mb-4">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Cash Reserve</span>
                <DollarSign size={14} className="text-amber-600" />
              </div>
              <div className="text-3xl font-black text-emerald-900">${stats.money.toLocaleString()}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-800 p-3 rounded-2xl border-b-4 border-emerald-950 text-center">
              <Leaf className="mx-auto text-emerald-400 mb-1" size={18} />
              <div className="text-sm font-black text-white">{stats.ecoScore}%</div>
            </div>
            <div className="bg-emerald-800 p-3 rounded-2xl border-b-4 border-emerald-950 text-center">
              <Star className="mx-auto text-amber-400 mb-1" size={18} />
              <div className="text-sm font-black text-white">{stats.reputation}%</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Experience */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] relative">
        
        {/* Mentor Briefing */}
        <section className="relative group max-w-4xl mx-auto">
          <div className="absolute -inset-2 bg-amber-400 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative flex gap-6 items-center bg-white border-8 border-amber-400 p-8 rounded-[40px] shadow-[0_15px_0_0_#d97706]">
            <div className="relative flex-shrink-0">
               <div className="bg-rose-400 w-28 h-28 rounded-full border-8 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="text-white text-6xl font-black drop-shadow-md">👨‍🌾</div>
               </div>
            </div>
            <div className="flex-1">
              <h4 className="text-amber-600 font-black text-sm mb-1 uppercase tracking-[0.2em]">Consultant: Don Carlos</h4>
              <p className="text-slate-800 text-xl font-bold italic leading-relaxed">"{mentorSpeech}"</p>
            </div>
          </div>
        </section>

        {/* Views */}
        <section className="animate-in fade-in duration-700 max-w-6xl mx-auto">
          {view === 'community' ? (
            <div className="space-y-10">
              {/* National Park Project */}
              <div className="bg-white rounded-[50px] p-10 border-8 border-emerald-100 shadow-[0_20px_0_0_#d1fae5] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-10 text-emerald-900"><Handshake size={200} /></div>
                 <div className="flex items-center gap-6 mb-8">
                    <div className="bg-emerald-500 p-5 rounded-3xl text-white shadow-xl"><Globe size={40} /></div>
                    <div>
                      <h3 className="text-3xl font-black italic text-emerald-900">National Park Expansion</h3>
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm">Classroom Cooperative Project</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-end">
                       <div className="text-emerald-800 font-black">
                          <span className="text-5xl">${community.projectCurrent.toLocaleString()}</span>
                          <span className="text-2xl text-emerald-300 ml-2">/ ${community.projectGoal.toLocaleString()}</span>
                       </div>
                       <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-black border-4 border-amber-300">
                          {Math.round((community.projectCurrent / community.projectGoal) * 100)}% Funded
                       </div>
                    </div>
                    <div className="w-full h-12 bg-emerald-50 rounded-[25px] border-4 border-emerald-100 shadow-inner p-2">
                       <div 
                         className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                         style={{ width: `${(community.projectCurrent / community.projectGoal) * 100}%` }} 
                       />
                    </div>
                    <div className="flex gap-4">
                       {[50, 200, 500].map(amt => (
                         <button 
                           key={amt}
                           onClick={() => handleDonate(amt)}
                           disabled={stats.money < amt}
                           className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_0_0_#d97706] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                         >
                           Donate ${amt}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Classroom Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 bg-white rounded-[50px] p-10 border-8 border-white shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                       <Trophy className="text-amber-500" size={32} />
                       <h3 className="text-2xl font-black italic uppercase">Pueblo Leaderboard</h3>
                    </div>
                    <div className="space-y-4">
                       {community.peers.sort((a, b) => b.score - a.score).map((peer, idx) => (
                         <div key={peer.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border-4 border-white shadow-sm hover:scale-[1.02] transition-transform">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'}`}>
                               {idx + 1}
                            </div>
                            <div className="text-3xl">{peer.avatar}</div>
                            <div className="flex-1">
                               <div className="font-black text-slate-800 uppercase tracking-tight">{peer.name}</div>
                               <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1"><Leaf size={10} className="text-emerald-500"/> {peer.ecoScore}% Eco</span>
                                  <span className="flex items-center gap-1"><Handshake size={10} className="text-amber-500"/> ${peer.contribution} Donated</span>
                               </div>
                            </div>
                            <div className="text-2xl font-black text-emerald-600">${peer.score}</div>
                            <button className="bg-rose-400 hover:bg-rose-500 text-white p-3 rounded-2xl shadow-[0_4px_0_0_#9f1239] active:translate-y-[4px] active:shadow-none">
                               <Gift size={18} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Social Context */}
                 <div className="bg-amber-400 rounded-[50px] p-10 text-white shadow-[0_20px_0_0_#d97706] relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 opacity-10"><BrainCircuit size={150} /></div>
                    <h3 className="text-2xl font-black italic mb-6">Market Economics</h3>
                    <div className="space-y-6 italic font-bold">
                       <div className="bg-white/20 p-4 rounded-3xl">
                          "¡Oiga! When everyone builds suites, the Eco-Score drops for the whole village. This is called a <strong>Negative Externality</strong>."
                       </div>
                       <div className="bg-white/20 p-4 rounded-3xl">
                          "Working together on the park is a <strong>Public Good</strong>. Everyone benefits, even if they don't pay!"
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : view === 'operations' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {slots.map(slot => (
                <ServiceTile 
                  key={slot.id} 
                  slot={slot} 
                  currentTime={currentTime} 
                  stats={stats}
                  onAssign={(sid) => startService(slot.id, sid)} 
                  onComplete={() => finishService(slot.id)}
                />
              ))}
            </div>
          ) : view === 'requests' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bookings.map(req => (
                <BookingCard key={req.id} req={req} stats={stats} onAccept={() => {
                  const serviceId = Object.keys(req.servicesNeeded)[0];
                  const emptySlot = slots.find(s => !s.serviceId);
                  if (emptySlot) {
                    startService(emptySlot.id, serviceId, req.groupName);
                    setBookings(prev => prev.filter(b => b.id !== req.id));
                  } else {
                    setMentorSpeech("¡Qué pena! No more room. We need more capacity!");
                  }
                }} />
              ))}
            </div>
          ) : view === 'assets' ? (
            <div className="space-y-12">
               <div className="bg-white rounded-[50px] p-10 border-8 border-emerald-100 shadow-[0_25px_0_0_rgba(0,0,0,0.05)] overflow-hidden relative">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 text-emerald-900 rotate-12"><Briefcase size={240} /></div>
                <div className="flex items-center gap-4 mb-10">
                   <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg"><Briefcase size={32} /></div>
                   <h3 className="text-3xl font-black italic text-emerald-900">The Tool Shed</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {Object.entries(stats.inventory).map(([item, qty]) => (
                    <div key={item} className="bg-[#F8FAF3] p-6 rounded-[35px] border-4 border-white shadow-xl flex flex-col items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item}</span>
                      <div className="text-4xl font-black text-emerald-900 mb-6">{qty}</div>
                      <button 
                        onClick={() => setStats(prev => ({ ...prev, money: prev.money - 50, inventory: { ...prev.inventory, [item]: prev.inventory[item] + 5 } }))}
                        disabled={stats.money < 50}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#d97706] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none uppercase text-xs tracking-widest"
                      >
                        Buy 5 ($50)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-white rounded-[50px] p-10 border-8 border-emerald-50 shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                   <TrendingUp className="text-emerald-600" size={32} />
                   <h3 className="text-3xl font-black italic text-emerald-900">Revenue Ledger</h3>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" hide />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} />
                      <Area type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={10} fill="#4CAF50" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ServiceTile({ slot, currentTime, stats, onAssign, onComplete }: any) {
  const level = slot.serviceId ? stats.upgrades[slot.serviceId] : 1;
  const service = slot.serviceId ? SERVICE_TIERS[slot.serviceId][level] : null;
  const isDone = slot.endTime && currentTime >= slot.endTime;
  const progress = slot.startTime && slot.endTime ? Math.min(100, ((currentTime - slot.startTime) / (slot.endTime - slot.startTime)) * 100) : 0;

  return (
    <div className={`relative h-64 rounded-[45px] border-8 transition-all p-8 flex flex-col justify-between overflow-hidden group ${
      slot.serviceId ? 'bg-white border-white shadow-[0_20px_0_0_#E2E8F0]' : 'bg-[#EDF2F7] border-dashed border-slate-300 shadow-inner'
    }`}>
      {!slot.serviceId ? (
        <div className="flex flex-col h-full justify-between">
          <h4 className="text-lg font-black text-slate-400 uppercase tracking-tighter italic">Slot {slot.id + 1}</h4>
          <div className="flex gap-3 relative z-10">
            {Object.keys(SERVICE_TIERS).map(sid => (
              <button 
                key={sid} onClick={() => onAssign(sid)}
                className="w-14 h-14 bg-white rounded-2xl border-4 border-slate-100 hover:border-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {getServiceIcon(sid, 28)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start z-10">
            <div>
               <h4 className="text-xl font-black text-slate-900 tracking-tight italic leading-none mb-1">{service?.name}</h4>
               <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  <User size={10} /> {slot.guestName}
               </div>
            </div>
            {isDone ? <CheckCircle size={28} className="text-emerald-500 animate-bounce" /> : <Clock size={28} className="text-amber-400 animate-spin-slow" />}
          </div>
          <div className="relative z-10">
            {isDone ? (
              <button onClick={onComplete} className="w-full bg-emerald-500 text-white font-black py-5 rounded-[25px] shadow-[0_8px_0_0_#065f46] active:translate-y-[8px] active:shadow-none transition-all uppercase text-sm tracking-widest">
                Complete Tour!
              </button>
            ) : (
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 shadow-inner p-1">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({ req, stats, onAccept }: any) {
  const serviceKey = Object.keys(req.servicesNeeded)[0];
  const level = stats.upgrades[serviceKey] || 1;
  const service = SERVICE_TIERS[serviceKey][level];

  return (
    <div className="bg-white rounded-[45px] p-10 border-8 border-white shadow-[0_25px_0_0_#E2E8F0] relative overflow-hidden group border-l-[16px] border-l-[#FFC107]">
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h4 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors italic uppercase leading-none mb-2">{req.groupName}</h4>
          <span className="text-[10px] px-4 py-1 rounded-full font-black tracking-widest uppercase bg-rose-500 text-white shadow-sm">
             {req.urgency === 'high' ? '🔥 VIP GUEST' : '⭐ STANDARD'}
          </span>
        </div>
        <div className="bg-amber-100 text-amber-600 p-4 rounded-3xl border-4 border-amber-300 text-center">
           <div className="text-xs font-black uppercase opacity-50 mb-1">Fee</div>
           <div className="text-3xl font-black leading-none">${req.totalPay.toFixed(0)}</div>
        </div>
      </div>
      <div className="bg-[#F8FAF3] p-6 rounded-[30px] mb-8 border-4 border-white shadow-inner flex items-center gap-4">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-lg border-4 border-emerald-400 flex items-center justify-center text-emerald-600">
           {getServiceIcon(serviceKey, 28)}
        </div>
        <span className="text-sm font-black text-emerald-900 uppercase tracking-tight">{service?.name}</span>
      </div>
      <button onClick={onAccept} className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] shadow-[0_10px_0_0_#000000] active:translate-y-[10px] active:shadow-none transition-all uppercase tracking-widest text-sm">
        Accept Guest
      </button>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[25px] transition-all duration-300 relative group ${
        active ? 'bg-emerald-800 text-white shadow-[0_6px_0_0_#064e3b] font-black italic scale-105 border-2 border-white/20' : 'text-emerald-100 hover:text-white hover:bg-emerald-800/50'
      }`}>
      <span className={active ? 'text-amber-300' : ''}>{icon}</span>
      <span className="text-sm tracking-tight uppercase">{label}</span>
    </button>
  );
}
