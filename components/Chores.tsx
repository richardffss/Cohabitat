import React, { useState } from 'react';
import { Chore, User } from '../types';
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { generateChoreSchedule } from '../services/geminiService';

interface ChoresProps {
  chores: Chore[];
  users: User[];
  addChore: (chore: Chore) => void;
  toggleChore: (id: string) => void;
}

export const Chores: React.FC<ChoresProps> = ({ chores, users, addChore, toggleChore }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeChores = chores.filter(c => !c.completed);
  const completedChores = chores.filter(c => c.completed).sort((a,b) => b.dueDate.localeCompare(a.dueDate)); 

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    const tasks = ["Clean Kitchen", "Take out Trash", "Vacuum Living Room", "Clean Bathroom", "Water Plants"];
    
    const suggestedChores = await generateChoreSchedule(users, tasks);
    
    suggestedChores.forEach(suggestion => {
        const assignedUser = users.find(u => u.name === suggestion.assignedToName) || users[0];
        const newChore: Chore = {
            id: Math.random().toString(36).substr(2, 9),
            title: suggestion.title,
            assignedTo: assignedUser.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            frequency: 'Weekly'
        };
        addChore(newChore);
    });

    setIsGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
        {/* Magnet Header */}
        <div className="flex justify-center -mb-6 relative z-20">
             <div className="w-48 h-12 bg-indigo-500 rounded-full shadow-lg border-2 border-indigo-600 flex items-center justify-center text-white font-bold tracking-widest uppercase">
                Chores
             </div>
        </div>

        {/* Paper Pad */}
        <div className="bg-white pt-8 pb-6 px-4 md:pt-10 md:pb-8 md:px-8 shadow-2xl rounded-lg relative min-h-[600px] border-t-8 border-slate-300">
             
             {/* Binding holes (visual) */}
             <div className="absolute top-2 left-0 w-full flex justify-between px-2 md:px-4">
                 {[...Array(6)].map((_,i) => <div key={i} className="w-3 h-3 bg-slate-800 rounded-full opacity-20" />)}
             </div>

             <div className="flex justify-end mb-6">
                <button 
                    onClick={handleGenerateSchedule}
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded"
                >
                    <Sparkles size={14} />
                    {isGenerating ? 'Asking Mom...' : 'Auto-Assign'}
                </button>
             </div>

             <div className="flex gap-4 border-b-2 border-indigo-100 mb-6">
                <button
                className={`pb-2 px-2 text-sm font-bold uppercase tracking-wide ${activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-[2px]' : 'text-slate-400'}`}
                onClick={() => setActiveTab('active')}
                >
                To Do
                </button>
                <button
                className={`pb-2 px-2 text-sm font-bold uppercase tracking-wide ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-[2px]' : 'text-slate-400'}`}
                onClick={() => setActiveTab('history')}
                >
                Done
                </button>
            </div>

            <div className="space-y-0">
                {(activeTab === 'active' ? activeChores : completedChores).map((chore, idx) => {
                const assignee = users.find(u => u.id === chore.assignedTo);
                return (
                    <div key={chore.id} className={`group flex items-center gap-2 md:gap-4 py-4 border-b border-indigo-50 ${chore.completed ? 'opacity-50' : ''}`}>
                        
                        <button onClick={() => toggleChore(chore.id)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                             {chore.completed ? <CheckCircle2 size={24} className="text-indigo-500" /> : <Circle size={24} />}
                        </button>

                        <div className="flex-1">
                             <h3 className={`font-handwriting text-xl md:text-2xl text-slate-800 ${chore.completed ? 'line-through decoration-indigo-300' : ''}`}>
                                {chore.title}
                             </h3>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold uppercase px-1.5 rounded ${
                                    chore.frequency === 'Weekly' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                }`}>{chore.frequency}</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={12} /> {new Date(chore.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </span>
                             </div>
                        </div>

                        <div className="flex flex-col items-center">
                             <div className="w-8 h-8 rounded-full border border-slate-200 p-0.5">
                                 <img src={assignee?.avatar} alt={assignee?.name} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all" />
                             </div>
                             <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">{assignee?.name}</span>
                        </div>
                    </div>
                );
                })}

                {activeTab === 'active' && activeChores.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-handwriting text-3xl text-slate-300">All clean!</p>
                        <div className="mt-4 text-4xl">✨</div>
                    </div>
                )}
            </div>
             
             {/* Lines background */}
             <div className="absolute inset-0 pointer-events-none z-0 pt-[120px] px-8">
                 <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(transparent, transparent 71px, #e0e7ff 72px)' }}></div>
             </div>
        </div>
    </div>
  );
};
