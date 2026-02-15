import React, { useState, useEffect } from 'react';
import { User, Expense, Chore, ShoppingItem, Announcement, ViewState, CalendarEvent, Poll, RecurringExpense, Position, LedgerState } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Expenses } from './components/Expenses';
import { Chores } from './components/Chores';
import { ShoppingList } from './components/ShoppingList';
import { Announcements } from './components/Announcements';
import { Calendar } from './components/Calendar';
import { Polls } from './components/Polls';
import { Corkboard } from './components/Corkboard';

// Mock Data Initialization
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alex', avatar: 'https://picsum.photos/seed/alex/200', color: 'blue' },
  { id: 'u2', name: 'Jordan', avatar: 'https://picsum.photos/seed/jordan/200', color: 'green' },
  { id: 'u3', name: 'Casey', avatar: 'https://picsum.photos/seed/casey/200', color: 'purple' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // App State
  const [users] = useState<User[]>(INITIAL_USERS);
  const currentUser = users[0]; // Simulate logged in user

  // Showcase Data
  const [expenses, setExpenses] = useState<Expense[]>([
      { id: 'ex1', description: 'Monthly Rent', amount: 1500, paidBy: 'u1', date: new Date().toISOString(), category: 'Rent', splitAmong: ['u1', 'u2', 'u3'] },
      { id: 'ex2', description: 'Grocery Run', amount: 124.50, paidBy: 'u2', date: new Date(Date.now() - 86400000).toISOString(), category: 'Food', splitAmong: ['u1', 'u2', 'u3'] },
      { id: 'ex3', description: 'Internet Bill', amount: 80, paidBy: 'u3', date: new Date(Date.now() - 172800000).toISOString(), category: 'Utilities', splitAmong: ['u1', 'u2', 'u3'] },
  ]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  
  const [chores, setChores] = useState<Chore[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
        id: '1',
        authorId: 'u1',
        title: 'Wifi Changed',
        content: 'New pass: "CleanHouse2024!"',
        date: new Date().toISOString(),
        type: 'General',
        position: { x: 50, y: 50 },
        zIndex: 1
    },
    {
        id: '2',
        authorId: 'u3',
        title: 'Mom Visiting',
        content: 'My mom is coming this weekend, please hide the party supplies!',
        date: new Date().toISOString(),
        type: 'Urgent',
        position: { x: 350, y: 400 },
        zIndex: 2
    }
  ]);

  const [ledgerState, setLedgerState] = useState<LedgerState>({
      position: { x: 650, y: 50 },
      zIndex: 10
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'e1',
      title: 'House Cleaning',
      date: new Date().toISOString(),
      time: '10:00',
      type: 'Household',
      createdBy: 'u1',
      reminder: true
    }
  ]);
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 'p1',
      question: 'Pizza tonight?',
      createdBy: 'u2',
      createdAt: new Date().toISOString(),
      votes: { 'u1': 'yes', 'u2': 'yes' },
      status: 'open',
      position: { x: 50, y: 350 },
      zIndex: 3
    }
  ]);

  // Handlers
  const addExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  
  const addRecurringExpense = (expenseData: Omit<Expense, 'id'>, frequency: 'Weekly' | 'Monthly') => {
    const recurringDef: RecurringExpense = {
        id: `rec-${Date.now()}`,
        description: expenseData.description,
        amount: expenseData.amount,
        paidBy: expenseData.paidBy,
        category: expenseData.category,
        splitAmong: expenseData.splitAmong,
        frequency,
        startDate: expenseData.date
    };
    setRecurringExpenses(prev => [recurringDef, ...prev]);

    const futureExpenses: Expense[] = [];
    let currentDate = new Date(expenseData.date);
    
    for (let i = 0; i < 5; i++) {
        futureExpenses.push({
            id: `gen-${Date.now()}-${i}`,
            description: expenseData.description,
            amount: expenseData.amount,
            paidBy: expenseData.paidBy,
            category: expenseData.category,
            splitAmong: expenseData.splitAmong,
            date: currentDate.toISOString()
        });
        
        if (frequency === 'Weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    }
    setExpenses(prev => [...futureExpenses, ...prev]);
  };

  const addChore = (chore: Chore) => setChores(prev => [...prev, chore]);
  const toggleChore = (id: string) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const addItem = (item: ShoppingItem) => setShoppingList(prev => [...prev, item]);
  const toggleItem = (id: string) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };
  const deleteItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const addAnnouncement = (ann: Announcement) => setAnnouncements(prev => [ann, ...prev]);

  const addEvent = (event: CalendarEvent) => setCalendarEvents(prev => [...prev, event]);

  const addPoll = (poll: Poll) => setPolls(prev => [poll, ...prev]);
  
  const votePoll = (pollId: string, vote: 'yes' | 'no') => {
    setPolls(prev => prev.map(p => {
        if (p.id !== pollId) return p;
        return {
            ...p,
            votes: {
                ...p.votes,
                [currentUser.id]: vote
            }
        };
    }));
  };

  const updatePollPosition = (id: string, pos: Position) => {
      setPolls(prev => prev.map(p => p.id === id ? { ...p, position: pos } : p));
  };

  const updateAnnouncementPosition = (id: string, pos: Position) => {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, position: pos } : a));
  };

  const updateLedgerPosition = (pos: Position) => {
      setLedgerState(prev => ({ ...prev, position: pos }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            users={users} 
            expenses={expenses} 
            chores={chores} 
            shoppingList={shoppingList} 
            announcements={announcements} 
          />
        );
      case 'corkboard':
        return (
            <Corkboard 
                users={users}
                currentUser={currentUser}
                expenses={expenses}
                polls={polls}
                announcements={announcements}
                ledgerState={ledgerState}
                addExpense={addExpense}
                addRecurringExpense={addRecurringExpense}
                addPoll={addPoll}
                votePoll={votePoll}
                addAnnouncement={addAnnouncement}
                updatePollPosition={updatePollPosition}
                updateAnnouncementPosition={updateAnnouncementPosition}
                updateLedgerPosition={updateLedgerPosition}
            />
        );
      case 'chores':
        return <Chores chores={chores} users={users} addChore={addChore} toggleChore={toggleChore} />;
      case 'shopping':
        return <ShoppingList items={shoppingList} users={users} addItem={addItem} toggleItem={toggleItem} deleteItem={deleteItem} />;
      case 'calendar':
        return <Calendar events={calendarEvents} users={users} addEvent={addEvent} />;
      default:
        return <Dashboard users={users} expenses={expenses} chores={chores} shoppingList={shoppingList} announcements={announcements} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
