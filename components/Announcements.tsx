import React from 'react';
import { Announcement, User } from '../types';

interface AnnouncementNoteProps {
    announcement: Announcement;
    users: User[];
}

export const AnnouncementNote: React.FC<AnnouncementNoteProps> = ({ announcement, users }) => {
    const author = users.find(u => u.id === announcement.authorId);

    // Sticky Note Colors
    const getNoteStyle = (t: Announcement['type']) => {
        switch (t) {
            case 'Urgent': return 'bg-rose-200 shadow-md';
            case 'Party': return 'bg-purple-200 shadow-md';
            case 'Maintenance': return 'bg-yellow-200 shadow-md';
            default: return 'bg-blue-100 shadow-md';
        }
    };

    return (
        <div className={`relative p-6 min-h-[200px] w-[280px] flex flex-col transition-transform hover:scale-105 ${getNoteStyle(announcement.type)}`}>
            {/* Tape or Pin effect based on type */}
            {announcement.type === 'Urgent' ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-500 shadow border-2 border-red-600 pointer-events-none" />
            ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 rotate-1 backdrop-blur-sm pointer-events-none" />
            )}

            <h3 className="font-bold text-lg text-slate-800 mb-2 mt-2">{announcement.title}</h3>
            <p className="text-slate-800 text-lg leading-relaxed mb-4 whitespace-pre-wrap font-handwriting flex-1">
                {announcement.content}
            </p>

            <div className="flex items-center justify-end gap-2 mt-auto opacity-70">
                <span className="font-handwriting text-sm">- {author?.name}</span>
            </div>
        </div>
    );
};

// Deprecated separate view
export const Announcements: React.FC<any> = () => {
  return null;
};
