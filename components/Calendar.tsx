import React, { useState } from 'react';
import { CalendarEvent, User } from '../types';
import { ChevronLeft, ChevronRight, Plus, Clock, Bell } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  users: User[];
  addEvent: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, users, addEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('Household');
  const [hasReminder, setHasReminder] = useState(false);

  // Calendar Logic
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getDaysArray = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsAdding(false);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const eventDate = new Date(selectedDate);
    // Combine date and time
    const [hours, minutes] = newEventTime.split(':').map(Number);
    eventDate.setHours(hours, minutes);

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: eventDate.toISOString(),
      time: newEventTime,
      type: newEventType,
      createdBy: users[0].id,
      reminder: hasReminder
    };

    addEvent(newEvent);
    setNewEventTitle('');
    setIsAdding(false);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === date.getDate() &&
             eDate.getMonth() === date.getMonth() &&
             eDate.getFullYear() === date.getFullYear();
    }).sort((a, b) => a.time.localeCompare(b.time));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col md:flex-row gap-8">
      {/* Calendar Grid (Paper hanging) */}
      <div className="flex-1 bg-white p-2 md:p-6 shadow-xl relative border-t-[12px] border-red-600 rounded-t-lg">
        {/* Hole Punch for hanging */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-inner" />
        
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl md:text-3xl font-bold text-slate-800 font-serif">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-400">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="bg-slate-50 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                {day}
            </div>
          ))}
          {getDaysArray().map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-slate-50 min-h-[60px] md:min-h-[80px]" />;
            
            const isSelected = selectedDate.getDate() === date.getDate() && 
                             selectedDate.getMonth() === date.getMonth() &&
                             selectedDate.getFullYear() === date.getFullYear();
            const dayEvents = getEventsForDay(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <button
                key={date.toString()}
                onClick={() => handleDayClick(date)}
                className={`bg-white min-h-[60px] md:min-h-[80px] p-1 md:p-2 text-left transition-colors hover:bg-blue-50 relative group ${isSelected ? 'ring-2 ring-inset ring-red-400 bg-red-50' : ''}`}
              >
                <span className={`text-xs md:text-sm font-bold ${isToday ? 'bg-red-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                  {date.getDate()}
                </span>
                <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1">
                    {dayEvents.slice(0, 4).map(e => (
                        <div key={e.id} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${e.type === 'Household' ? 'bg-blue-500' : e.type === 'Personal' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Panel: Daily Detail (Another paper under a magnet) */}
      <div className="w-full md:w-80 bg-yellow-50 p-4 md:p-6 shadow-md relative">
        {/* Magnet */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-green-500 shadow border-2 border-green-600" />
        
        <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-yellow-200 pb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800 font-handwriting">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
            </h3>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-400 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors ${isAdding ? 'rotate-45' : ''}`}
          >
            <Plus size={20} />
          </button>
        </div>

        {isAdding && (
            <form onSubmit={handleAddEvent} className="mb-6 bg-white p-3 shadow-inner border border-yellow-200">
                <input 
                    type="text" 
                    placeholder="Event..."
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="w-full p-2 border-b border-slate-200 text-sm outline-none font-handwriting text-lg"
                    autoFocus
                />
                <div className="flex gap-2 mt-2">
                    <input 
                        type="time" 
                        value={newEventTime}
                        onChange={e => setNewEventTime(e.target.value)}
                        className="w-24 p-1 border-b border-slate-200 text-xs bg-transparent"
                    />
                    <select 
                        value={newEventType}
                        onChange={e => setNewEventType(e.target.value as any)}
                        className="flex-1 p-1 border-b border-slate-200 text-xs bg-transparent"
                    >
                        <option value="Household">Home</option>
                        <option value="Personal">Me</option>
                        <option value="Maintenance">Fix</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input 
                        type="checkbox" 
                        id="reminder" 
                        checked={hasReminder} 
                        onChange={e => setHasReminder(e.target.checked)}
                    />
                    <label htmlFor="reminder" className="text-xs text-slate-500">Remind me</label>
                </div>
                <button type="submit" className="w-full mt-3 py-1 bg-slate-800 text-white text-xs font-bold uppercase">Write it down</button>
            </form>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {getEventsForDay(selectedDate).map(event => {
                const author = users.find(u => u.id === event.createdBy);
                return (
                    <div key={event.id} className="flex items-start gap-3 border-b border-yellow-200/50 pb-2">
                        <div className="mt-1 font-mono text-xs text-slate-500 w-10 text-right">
                             {event.time}
                        </div>
                        <div className="flex-1">
                            <p className="font-handwriting text-xl text-slate-800 leading-none mb-1">{event.title}</p>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    event.type === 'Household' ? 'bg-blue-400' : 
                                    event.type === 'Personal' ? 'bg-green-400' : 
                                    'bg-yellow-400'
                                }`} />
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">{author?.name}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {getEventsForDay(selectedDate).length === 0 && !isAdding && (
                <div className="text-center py-10 text-slate-400 font-handwriting text-xl">
                    Nothing today...
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
