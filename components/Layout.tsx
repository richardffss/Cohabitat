import React, { useState, useEffect } from 'react';
import { Home, ThermometerSnowflake, Refrigerator, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [doorOpen, setDoorOpen] = useState(false);

  // Effect to handle the door animation sequence
  useEffect(() => {
    if (currentView === 'shopping') {
      setDoorOpen(true);
    } else {
      setDoorOpen(false);
    }
  }, [currentView]);

  const getEnvironmentClass = () => {
    switch (currentView) {
      case 'dashboard':
        return 'bg-slate-50'; // Kitchen Counter / Neutral
      case 'corkboard':
        // Corkboard pattern
        return 'bg-[#eecfa1] bg-[radial-gradient(#d4b483_2px,transparent_2px)] [background-size:16px_16px] shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]'; 
      case 'chores':
      case 'calendar':
        // Brushed Metal / Fridge Door
        return 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300';
      case 'shopping':
        // Inside Fridge (Cold blue/white with vignette)
        return 'bg-slate-100 shadow-[inset_0_0_150px_rgba(0,0,0,0.2)]';
      default:
        return 'bg-slate-50';
    }
  };

  const getContainerStyle = () => {
    switch (currentView) {
      case 'corkboard':
        return 'border-[10px] md:border-[20px] border-[#8B4513] rounded-lg shadow-2xl'; // Wood frame
      case 'chores':
      case 'calendar':
        return 'border-r-4 border-b-4 md:border-r-8 md:border-b-8 border-slate-300 rounded-3xl shadow-2xl relative overflow-hidden before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-white/40 before:to-transparent before:pointer-events-none'; // Fridge look
      case 'shopping':
        // Fridge Interior: Thick rubber seal border + plastic liner feel. Reduced border on mobile.
        return 'border-[8px] md:border-[16px] border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-[inset_0_0_80px_rgba(0,255,255,0.05)] relative overflow-hidden ring-1 ring-slate-300'; 
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-800 overflow-hidden font-sans">
      
      {/* Top Navigation / Room Switcher */}
      <nav className="bg-slate-900 text-white p-3 md:p-4 shadow-lg z-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-indigo-400">Cohabitat</h1>
            <span className="text-xs text-slate-500 uppercase tracking-widest hidden md:inline">| KitchenOS</span>
        </div>
        
        <div className="flex gap-1 md:gap-4 overflow-x-auto no-scrollbar mask-linear-fade">
            <button 
                onClick={() => onChangeView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <Home size={18} />
                {currentView === 'dashboard' && <span className="animate-fade-in text-sm font-medium">Home</span>}
            </button>

            <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block" />

            {/* Wall Group */}
            <button 
                onClick={() => onChangeView('corkboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentView === 'corkboard' ? 'bg-[#8B4513] text-amber-100 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Bulletin Board"
            >
                <LayoutDashboard size={18} />
                {currentView === 'corkboard' && <span className="animate-fade-in text-sm font-medium">Corkboard</span>}
            </button>

            {/* Fridge Group */}
            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                <button 
                    onClick={() => onChangeView('calendar')}
                    className={`p-2 rounded-lg transition-all ${['calendar', 'chores'].includes(currentView) ? 'bg-slate-300 text-slate-800' : 'text-slate-400 hover:text-white'}`}
                    title="Fridge Door"
                >
                    <Refrigerator size={18} />
                </button>
                 {['calendar', 'chores'].includes(currentView) && (
                    <div className="flex gap-1 animate-fade-in">
                        <button onClick={() => onChangeView('calendar')} className={`px-2 text-xs rounded ${currentView === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Cal</button>
                        <button onClick={() => onChangeView('chores')} className={`px-2 text-xs rounded ${currentView === 'chores' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Chores</button>
                    </div>
                )}
            </div>

             {/* Inside Fridge */}
             <button 
                onClick={() => onChangeView('shopping')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentView === 'shopping' ? 'bg-cyan-900 text-cyan-100 border border-cyan-700' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <ThermometerSnowflake size={18} />
                {currentView === 'shopping' && <span className="animate-fade-in text-sm font-medium">Inside</span>}
            </button>
        </div>
      </nav>

      {/* Main Environment View */}
      <div className="flex-1 p-2 md:p-8 flex items-center justify-center overflow-hidden relative perspective-1000">
        
        {/* The Container (Board, Fridge, etc) */}
        <main className={`relative w-full max-w-6xl h-full overflow-y-auto overflow-x-hidden transition-all duration-700 ease-in-out ${getEnvironmentClass()} ${getContainerStyle()}`}>
            
            {/* Interior Fridge Light Effect */}
            {currentView === 'shopping' && (
                <>
                    {/* Top Light */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/20 blur-[60px] pointer-events-none z-10" />
                    {/* Cool tint overlay */}
                    <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none z-0" />
                </>
            )}

            {/* Fridge Door Animation Overlay (The door swinging open) */}
            <div 
                className={`absolute inset-0 bg-slate-200 z-50 origin-left transition-transform duration-700 ease-in-out border-r-8 border-slate-300 flex items-center justify-center
                ${currentView === 'shopping' ? '-rotate-y-90 opacity-0 pointer-events-none' : 'opacity-0 pointer-events-none hidden'}`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="text-slate-400">Opening...</div>
            </div>

            <div className="p-0 min-h-full relative z-0 h-full">
               {children}
            </div>

            {/* Visual Handle for Fridge Door Views */}
            {['calendar', 'chores'].includes(currentView) && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-32 md:h-64 bg-slate-300 rounded-l-xl shadow-lg border-l border-white/50" />
            )}
        </main>

      </div>
    </div>
  );
};