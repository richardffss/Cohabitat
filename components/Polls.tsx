import React, { useState } from 'react';
import { Poll, User } from '../types';
import { ThumbsUp, ThumbsDown, Plus, Sparkles, Pin } from 'lucide-react';
import { draftPollProposal } from '../services/geminiService';

interface PollCardProps {
    poll: Poll;
    currentUser: User;
    users: User[];
    votePoll: (pollId: string, vote: 'yes' | 'no') => void;
    rotation?: string;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, currentUser, users, votePoll, rotation = 'rotate-0' }) => {
    const author = users.find(u => u.id === poll.createdBy);
    const totalVotes = Object.keys(poll.votes).length;
    const yesVotes = Object.values(poll.votes).filter(v => v === 'yes').length;
    const noVotes = Object.values(poll.votes).filter(v => v === 'no').length;
    
    const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;
    const myVote = poll.votes[currentUser.id];

    // Determine pin color based on ID hash or random
    const pinColor = parseInt(poll.id.slice(-1)) % 3 === 0 ? 'text-red-500' : parseInt(poll.id.slice(-1)) % 3 === 1 ? 'text-green-500' : 'text-yellow-500';

    return (
        <div className={`bg-white p-6 shadow-md ${rotation} hover:rotate-0 transition-transform duration-300 relative border border-slate-100 h-fit w-[280px]`}>
            {/* Pin */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${pinColor} drop-shadow-md z-10 pointer-events-none`}>
                <Pin size={32} fill="currentColor" />
            </div>

            <div className="mt-2 mb-4">
                <p className="font-handwriting text-2xl text-slate-800 leading-snug text-center">
                    "{poll.question}"
                </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
                <img src={author?.avatar} className="w-6 h-6 rounded-full grayscale" alt="" />
                <span className="text-xs text-slate-500 font-mono uppercase">{author?.name} asks</span>
            </div>

            {/* Voting Interface (Stamp Style) */}
            <div className="flex gap-4 mb-6">
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => votePoll(poll.id, 'yes')}
                    className={`flex-1 flex flex-col items-center justify-center p-2 border-2 transition-all ${
                        myVote === 'yes' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                    }`}
                >
                    <ThumbsUp size={24} />
                    <span className="text-xs font-bold mt-1 uppercase">Yea</span>
                </button>
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => votePoll(poll.id, 'no')}
                    className={`flex-1 flex flex-col items-center justify-center p-2 border-2 transition-all ${
                        myVote === 'no' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                    }`}
                >
                    <ThumbsDown size={24} />
                    <span className="text-xs font-bold mt-1 uppercase">Nay</span>
                </button>
            </div>

            {/* Results (Bar) */}
            <div className="space-y-1">
                <div className="h-4 bg-slate-100 border border-slate-300 flex">
                    <div style={{ width: `${yesPercentage}%` }} className="bg-indigo-500/80 h-full border-r border-white/20"></div>
                    <div style={{ width: `${noPercentage}%` }} className="bg-rose-500/80 h-full"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                    <span>{yesVotes} Yea</span>
                    <span>{noVotes} Nay</span>
                </div>
            </div>
        </div>
    );
};

interface PollsProps {
  polls: Poll[];
  currentUser: User;
  users: User[];
  addPoll: (poll: Poll) => void;
  votePoll: (pollId: string, vote: 'yes' | 'no') => void;
}

// Deprecated separate view, but kept for legacy support if needed
export const Polls: React.FC<PollsProps> = ({ polls, currentUser, users, addPoll, votePoll }) => {
    // ... (This component is largely superseded by Corkboard, but we keep the card export)
    return null; 
};
