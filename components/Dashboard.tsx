import React from 'react';
import { User, Expense, Chore, ShoppingItem, Announcement } from '../types';
import { ArrowUpRight, CheckCircle2, ShoppingBag, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  users: User[];
  expenses: Expense[];
  chores: Chore[];
  shoppingList: ShoppingItem[];
  announcements: Announcement[];
}

export const Dashboard: React.FC<DashboardProps> = ({ users, expenses, chores, shoppingList, announcements }) => {
  
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const myPendingChores = chores.filter(c => !c.completed).length; 
  const pendingShopping = shoppingList.filter(i => !i.completed).length;
  const recentAnnouncement = announcements[0];

  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#94a3b8'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="text-center mb-6 md:mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 drop-shadow-sm">Good Morning</h2>
        <p className="text-slate-500 mt-2 font-medium">Coffee is ready on the counter.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Receipt Style */}
        <div className="bg-white p-6 shadow-md rotate-1 transform hover:rotate-0 transition-transform relative mx-auto w-full max-w-[240px]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-yellow-200/50 -rotate-2" /> {/* Tape */}
          <div className="border-b-2 border-dashed border-slate-200 pb-4 mb-4 text-center font-mono">
            <p className="text-xs uppercase text-slate-400">Total Due</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalExpenses.toFixed(0)}</h3>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono text-slate-500">**** **** **** 1234</p>
            <div className="mt-4 flex justify-center text-indigo-500">
                <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMTAgMTAgMCAyMCAxMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat-x bg-bottom"></div>
        </div>

        {/* Sticky Note Style */}
        <div className="bg-emerald-100 p-6 shadow-md -rotate-2 hover:rotate-0 transition-transform relative mx-auto w-full max-w-[240px]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-500 shadow-sm border border-red-600" /> {/* Magnet */}
          <h3 className="font-handwriting text-2xl text-emerald-900 mb-2 mt-2">To Do:</h3>
          <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-emerald-800">{myPendingChores}</span>
              <span className="text-emerald-700 leading-tight">chores left<br/>for me</span>
          </div>
        </div>

        {/* Notepad Style */}
        <div className="bg-white p-1 shadow-md rotate-1 hover:rotate-0 transition-transform relative mx-auto w-full max-w-[240px] border-t-8 border-slate-700 rounded-t-lg">
          <div className="bg-yellow-50 p-5 h-full min-h-[160px] flex flex-col items-center justify-center border-l-2 border-b-2 border-slate-200/50">
             <ShoppingBag size={32} className="text-amber-500 mb-2" />
             <h3 className="text-2xl font-bold text-slate-800">{pendingShopping}</h3>
             <p className="text-sm font-handwriting text-slate-500">items to buy</p>
          </div>
        </div>

        {/* Envelope/Card Style */}
        <div className="bg-white p-6 shadow-md -rotate-1 hover:rotate-0 transition-transform relative mx-auto w-full max-w-[240px] border border-slate-100">
           <div className="absolute top-2 right-2 text-rose-400">
              <Bell size={20} />
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Latest</p>
           <p className="font-handwriting text-lg text-slate-800 leading-snug">
            "{recentAnnouncement ? recentAnnouncement.title : "No news is good news"}"
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 md:mt-12">
        {/* Magazine/Chart Style */}
        <div className="bg-white p-4 md:p-8 shadow-lg rotate-1 rounded-sm relative">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs rotate-12">
            STATS
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">Monthly Expenses</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-handwriting">No data yet...</div>
            )}
          </div>
        </div>

        {/* Polaroids for Users */}
        <div className="grid grid-cols-2 gap-4">
            {users.map((user, idx) => (
                <div key={user.id} className={`bg-white p-3 pb-8 shadow-md ${idx % 2 === 0 ? '-rotate-2' : 'rotate-2'} transition-transform hover:z-10 hover:scale-105`}>
                   <img src={user.avatar} alt={user.name} className="w-full h-32 object-cover bg-slate-100 mb-3" />
                   <p className="font-handwriting text-center text-xl text-slate-800">{user.name}</p>
                </div>
            ))}
            <div className="bg-white p-3 pb-8 shadow-md rotate-3 flex items-center justify-center border-2 border-dashed border-slate-300">
                <p className="font-handwriting text-center text-slate-400">Guest?</p>
            </div>
        </div>
      </div>
    </div>
  );
};
