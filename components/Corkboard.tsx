import React, { useState } from 'react';
import { Announcement, Expense, Poll, User, Position, LedgerState } from '../types';
import { Draggable, MobileStackItem } from './Draggable';
import { PollCard } from './Polls';
import { AnnouncementNote } from './Announcements';
import { Expenses } from './Expenses';
import { Plus, StickyNote, Vote, DollarSign, Sparkles } from 'lucide-react';
import { draftAnnouncement, draftPollProposal } from '../services/geminiService';

interface CorkboardProps {
    users: User[];
    currentUser: User;
    expenses: Expense[];
    polls: Poll[];
    announcements: Announcement[];
    ledgerState: LedgerState;
    addExpense: (expense: Expense) => void;
    addRecurringExpense: (expense: Omit<Expense, 'id'>, frequency: 'Weekly' | 'Monthly') => void;
    addPoll: (poll: Poll) => void;
    votePoll: (pollId: string, vote: 'yes' | 'no') => void;
    addAnnouncement: (announcement: Announcement) => void;
    updatePollPosition: (id: string, pos: Position) => void;
    updateAnnouncementPosition: (id: string, pos: Position) => void;
    updateLedgerPosition: (pos: Position) => void;
}

export const Corkboard: React.FC<CorkboardProps> = ({
    users,
    currentUser,
    expenses,
    polls,
    announcements,
    ledgerState,
    addExpense,
    addRecurringExpense,
    addPoll,
    votePoll,
    addAnnouncement,
    updatePollPosition,
    updateAnnouncementPosition,
    updateLedgerPosition
}) => {
    // Local state for bringing items to front
    const [zIndices, setZIndices] = useState<Record<string, number>>({
        ledger: 10
    });
    
    // Create Mode States
    const [createMode, setCreateMode] = useState<'none' | 'poll' | 'note'>('none');
    const [newItemText, setNewItemText] = useState(''); // Shared for Poll Question / Note Title
    const [newItemContent, setNewItemContent] = useState(''); // Note Content
    const [aiDrafting, setAiDrafting] = useState(false);

    const bringToFront = (id: string) => {
        const maxZ = Math.max(...Object.values(zIndices), 10);
        setZIndices(prev => ({ ...prev, [id]: maxZ + 1 }));
    };

    const handleCreatePoll = () => {
        if (!newItemText.trim()) return;
        const newPoll: Poll = {
            id: Date.now().toString(),
            question: newItemText,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            votes: {},
            status: 'open',
            position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
            zIndex: Math.max(...Object.values(zIndices), 10) + 1
        };
        addPoll(newPoll);
        setCreateMode('none');
        setNewItemText('');
    };

    const handleCreateNote = () => {
        if (!newItemText.trim()) return;
        const newNote: Announcement = {
            id: Date.now().toString(),
            title: newItemText,
            content: newItemContent,
            authorId: currentUser.id,
            date: new Date().toISOString(),
            type: 'General',
            position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
            zIndex: Math.max(...Object.values(zIndices), 10) + 1
        };
        addAnnouncement(newNote);
        setCreateMode('none');
        setNewItemText('');
        setNewItemContent('');
    };

    const handleAiAssist = async () => {
        if (!newItemText) return;
        setAiDrafting(true);
        if (createMode === 'poll') {
            const improved = await draftPollProposal(newItemText);
            setNewItemText(improved);
        } else if (createMode === 'note') {
            const drafted = await draftAnnouncement(newItemText, "friendly");
            setNewItemContent(drafted);
        }
        setAiDrafting(false);
    };

    return (
        <div className="w-full h-[150vh] md:h-full relative overflow-y-auto md:overflow-hidden">
            
            {/* Speed Dial / Toolbar */}
            <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 items-end pointer-events-auto">
                {createMode !== 'none' && (
                     <div className="bg-white p-4 rounded-lg shadow-2xl border border-slate-200 mb-2 w-80 animate-in slide-in-from-bottom-5">
                         <h3 className="font-bold text-slate-700 mb-2">{createMode === 'poll' ? 'New Poll' : 'New Note'}</h3>
                         <input 
                            type="text" 
                            className="w-full border-b border-slate-300 p-2 text-sm outline-none mb-2"
                            placeholder={createMode === 'poll' ? "Question..." : "Title..."}
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                            autoFocus
                         />
                         {createMode === 'note' && (
                             <textarea 
                                className="w-full border border-slate-300 p-2 text-sm outline-none mb-2 h-20 resize-none font-handwriting"
                                placeholder="Content..."
                                value={newItemContent}
                                onChange={e => setNewItemContent(e.target.value)}
                             />
                         )}
                         <div className="flex justify-between items-center">
                             <button onClick={handleAiAssist} disabled={aiDrafting} className="text-indigo-600 p-1 hover:bg-indigo-50 rounded"><Sparkles size={16} /></button>
                             <div className="flex gap-2">
                                 <button onClick={() => setCreateMode('none')} className="text-xs text-slate-500 px-2 py-1">Cancel</button>
                                 <button onClick={createMode === 'poll' ? handleCreatePoll : handleCreateNote} className="text-xs bg-slate-800 text-white px-3 py-1 rounded shadow">Post</button>
                             </div>
                         </div>
                     </div>
                )}
                
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => setCreateMode('note')}
                        className="w-12 h-12 bg-[#8B4513] text-amber-100 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        title="Add Note"
                    >
                        <StickyNote size={24} />
                    </button>
                    <button 
                        onClick={() => setCreateMode('poll')}
                        className="w-12 h-12 bg-white text-slate-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        title="Add Poll"
                    >
                        <Vote size={24} />
                    </button>
                    {/* Expenses handles its own add state internally, we just provide the button to potentially focus/scroll to it if needed, or rely on the internal add button */}
                </div>
            </div>

            {/* --- DESKTOP VIEW (Absolute Positioning) --- */}
            <div className="hidden md:block w-full h-full relative">
                {/* Expense Ledger */}
                <Draggable 
                    id="ledger" 
                    initialPos={ledgerState.position} 
                    zIndex={zIndices['ledger'] || ledgerState.zIndex}
                    onUpdate={(_, pos) => updateLedgerPosition(pos)}
                    onFocus={bringToFront}
                >
                    <Expenses 
                        expenses={expenses} 
                        users={users} 
                        addExpense={addExpense} 
                        addRecurringExpense={addRecurringExpense} 
                    />
                </Draggable>

                {/* Polls */}
                {polls.map(poll => (
                    <Draggable
                        key={poll.id}
                        id={poll.id}
                        initialPos={poll.position || { x: 100, y: 100 }}
                        zIndex={zIndices[poll.id] || poll.zIndex || 1}
                        onUpdate={(id, pos) => updatePollPosition(id, pos)}
                        onFocus={bringToFront}
                    >
                        <PollCard 
                            poll={poll} 
                            currentUser={currentUser} 
                            users={users} 
                            votePoll={votePoll} 
                            rotation={parseInt(poll.id.slice(-1)) % 2 === 0 ? 'rotate-2' : '-rotate-1'}
                        />
                    </Draggable>
                ))}

                {/* Announcements */}
                {announcements.map(note => (
                    <Draggable
                        key={note.id}
                        id={note.id}
                        initialPos={note.position || { x: 300, y: 100 }}
                        zIndex={zIndices[note.id] || note.zIndex || 1}
                        onUpdate={(id, pos) => updateAnnouncementPosition(id, pos)}
                        onFocus={bringToFront}
                    >
                        <AnnouncementNote 
                            announcement={note} 
                            users={users} 
                        />
                    </Draggable>
                ))}
            </div>

            {/* --- MOBILE VIEW (Stacked) --- */}
            <div className="md:hidden flex flex-col p-4 pb-24">
                <MobileStackItem className="mb-8">
                    <Expenses 
                        expenses={expenses} 
                        users={users} 
                        addExpense={addExpense} 
                        addRecurringExpense={addRecurringExpense} 
                        className="w-full"
                    />
                </MobileStackItem>

                <h3 className="font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-300">Polls</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                    {polls.map(poll => (
                        <MobileStackItem key={poll.id} className="w-full max-w-[300px]">
                            <PollCard poll={poll} currentUser={currentUser} users={users} votePoll={votePoll} />
                        </MobileStackItem>
                    ))}
                </div>

                <h3 className="font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-300 mt-8">Board</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                     {announcements.map(note => (
                        <MobileStackItem key={note.id} className="w-full max-w-[300px]">
                            <AnnouncementNote announcement={note} users={users} />
                        </MobileStackItem>
                     ))}
                </div>
            </div>
        </div>
    );
};
