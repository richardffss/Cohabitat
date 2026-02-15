import React, { useState, useMemo } from 'react';
import { Expense, User } from '../types';
import { Plus, Sparkles, Filter, X, Pin, Check, RotateCw } from 'lucide-react';
import { analyzeExpenses } from '../services/geminiService';

interface ExpensesProps {
  expenses: Expense[];
  users: User[];
  addExpense: (expense: Expense) => void;
  addRecurringExpense: (expense: Omit<Expense, 'id'>, frequency: 'Weekly' | 'Monthly') => void;
  className?: string; // Support styling
  onMouseDown?: (e: React.MouseEvent) => void; // Support dragging
}

type SortField = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

export const Expenses: React.FC<ExpensesProps> = ({ expenses, users, addExpense, addRecurringExpense, className = '', onMouseDown }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<Expense['category']>('Other');
  const [splitOwners, setSplitOwners] = useState<string[]>(users.map(u => u.id)); 
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'Weekly' | 'Monthly'>('Monthly');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterUser, setFilterUser] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;

    const finalSplit = splitOwners.length > 0 ? splitOwners : users.map(u => u.id);
    const date = new Date().toISOString();

    if (isRecurring) {
        addRecurringExpense({
            description: newDesc,
            amount: parseFloat(newAmount),
            paidBy: users[0].id,
            category: newCategory,
            splitAmong: finalSplit,
            date: date,
        }, frequency);
    } else {
        const expense: Expense = {
            id: Date.now().toString(),
            description: newDesc,
            amount: parseFloat(newAmount),
            paidBy: users[0].id, 
            date: date,
            category: newCategory,
            splitAmong: finalSplit,
        };
        addExpense(expense);
    }

    setIsAdding(false);
    setNewDesc('');
    setNewAmount('');
    setSplitOwners(users.map(u => u.id));
    setIsRecurring(false);
  };

  const toggleSplitOwner = (userId: string) => {
    setSplitOwners(prev => {
        if (prev.includes(userId)) {
            if (prev.length === 1) return prev;
            return prev.filter(id => id !== userId);
        }
        return [...prev, userId];
    });
  };

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter(expense => {
      if (filterCategory !== 'All' && expense.category !== filterCategory) return false;
      if (filterUser !== 'All' && expense.paidBy !== filterUser) return false;
      const expenseDate = new Date(expense.date);
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        if (expenseDate < start) return false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999); 
        if (expenseDate > end) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'date') {
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        return multiplier * (a.amount - b.amount);
      }
    });
  }, [expenses, filterCategory, filterUser, filterStartDate, filterEndDate, sortField, sortDirection]);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeExpenses(filteredExpenses, users);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilterCategory('All');
    setFilterUser('All');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const calculatedShare = (parseFloat(newAmount) || 0) / (splitOwners.length || 1);

  return (
    <div className={`relative w-full md:w-[600px] ${className}`} onMouseDown={onMouseDown}>
      <div className="bg-white p-4 md:p-8 shadow-xl relative min-h-[600px] border border-slate-200">
        
        {/* Visual Pin - Acts as Drag Handle logic if needed, but the whole container is draggable now */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-500 drop-shadow-md z-10 pointer-events-none">
            <Pin size={40} fill="currentColor" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-slate-800 pb-4 mt-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-slate-800 uppercase tracking-widest pointer-events-none">Expense Ledger</h2>
          </div>
          {/* Prevent Drag Propagation on Buttons */}
          <div className="flex gap-2 print:hidden" onMouseDown={e => e.stopPropagation()}>
              <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded border-2 border-slate-800 transition-colors font-bold text-sm ${showFilters ? 'bg-slate-800 text-white' : 'text-slate-800 hover:bg-slate-100'}`}
              >
                  <Filter size={18} />
              </button>
              <button
                  onClick={handleAnalysis}
                  className="p-2 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                  disabled={isAnalyzing}
                  title="AI Audit"
              >
                  <Sparkles size={18} />
              </button>
              <button
              onClick={() => setIsAdding(true)}
              className="p-2 bg-slate-800 text-white rounded border-2 border-slate-800 hover:bg-slate-700 transition-colors"
              title="Add Entry"
              >
              <Plus size={18} />
              </button>
          </div>
        </div>

        <div onMouseDown={e => e.stopPropagation()}>
            {showFilters && (
            <div className="bg-slate-50 p-4 mb-6 border-2 border-dashed border-slate-300">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cat.</label>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-1 text-sm border-b border-slate-400 bg-transparent outline-none font-mono">
                        <option value="All">All</option>
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Entertainment">Fun</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">User</label>
                    <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="w-full p-1 text-sm border-b border-slate-400 bg-transparent outline-none font-mono">
                        <option value="All">All</option>
                        {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                    </select>
                </div>
                <button onClick={clearFilters} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                </div>
            </div>
            )}

            {aiAnalysis && (
                <div className="mb-6 bg-yellow-100 p-4 border border-yellow-200 text-sm font-handwriting text-slate-700 relative shadow-sm">
                    <div className="absolute -top-2 -right-2 w-24 h-4 bg-yellow-200/50 rotate-3" />
                    <button onClick={() => setAiAnalysis(null)} className="absolute top-1 right-1 text-slate-400"><X size={14} /></button>
                    <strong className="block text-indigo-800 mb-1">Note:</strong>
                    {aiAnalysis}
                </div>
            )}

            {isAdding && (
            <form onSubmit={handleAdd} className="mb-8 p-4 md:p-6 bg-slate-50 border-2 border-slate-200 shadow-inner">
                <h3 className="font-mono text-xs uppercase font-bold text-slate-500 mb-4 border-b border-slate-200 pb-2">New Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">What for?</label>
                    <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-2 border-b-2 border-slate-300 bg-transparent focus:border-slate-800 outline-none font-mono text-lg" placeholder="Item Description" />
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">How much?</label>
                    <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full p-2 border-b-2 border-slate-300 bg-transparent focus:border-slate-800 outline-none font-mono text-lg" placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="w-full p-2 border-b-2 border-slate-300 bg-transparent outline-none font-mono">
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2">Split among:</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {users.map(u => {
                            const isSelected = splitOwners.includes(u.id);
                            return (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => toggleSplitOwner(u.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded border-2 transition-all ${isSelected ? 'bg-white border-slate-800 text-slate-800 shadow-sm' : 'border-slate-200 text-slate-400 opacity-60'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200'}`}>
                                        {isSelected && <Check size={10} />}
                                    </div>
                                    <span className="text-xs font-bold">{u.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-indigo-50 border border-indigo-100 rounded">
                        <button 
                            type="button"
                            onClick={() => setIsRecurring(!isRecurring)}
                            className={`w-4 h-4 rounded border flex items-center justify-center ${isRecurring ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}
                        >
                            {isRecurring && <Check size={10} />}
                        </button>
                        <span className="text-xs font-bold uppercase text-indigo-800 flex items-center gap-1">
                            <RotateCw size={12} /> Recurring?
                        </span>
                        
                        {isRecurring && (
                            <select 
                                value={frequency} 
                                onChange={(e) => setFrequency(e.target.value as any)}
                                className="ml-auto text-xs p-1 rounded border border-indigo-200 outline-none text-indigo-900"
                            >
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        )}
                    </div>
                </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-4">
                    <div className="text-xs font-mono text-slate-500">
                        Est. <span className="font-bold text-slate-800">${calculatedShare.toFixed(2)}</span> / person
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-bold uppercase">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-slate-800 text-white font-bold text-sm uppercase shadow hover:bg-slate-700">
                            {isRecurring ? `Schedule ${frequency}` : 'Record'}
                        </button>
                    </div>
                </div>
            </form>
            )}
        </div>

        <div className="overflow-x-auto" onMouseDown={e => e.stopPropagation()}>
          <table className="w-full text-left text-sm font-mono border-collapse">
            <thead className="border-b-2 border-slate-800">
              <tr>
                <th className="py-2 cursor-pointer hover:underline" onClick={() => handleSort('date')}>Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th className="py-2">Item</th>
                <th className="py-2">Who</th>
                <th className="py-2">Type</th>
                <th className="py-2 text-right cursor-pointer hover:underline" onClick={() => handleSort('amount')}>$$$ {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredExpenses.map((expense) => {
                const user = users.find(u => u.id === expense.paidBy);
                return (
                  <tr key={expense.id} className="hover:bg-yellow-50/50">
                    <td className="py-3 text-slate-500">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="py-3 font-bold text-slate-800">
                        {expense.description}
                        {expense.splitAmong.length < users.length && (
                            <span className="ml-2 text-[10px] text-slate-400 font-normal bg-slate-100 px-1 rounded">
                                split: {expense.splitAmong.length}
                            </span>
                        )}
                    </td>
                    <td className="py-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-300">
                             <img src={user?.avatar} className="w-full h-full object-cover" alt="" />
                        </div>
                        <span className="text-xs">{user?.name}</span>
                    </td>
                    <td className="py-3"><span className="bg-slate-100 px-1 border border-slate-200 text-xs">{expense.category.substring(0,4).toUpperCase()}</span></td>
                    <td className="py-3 text-right font-bold">${expense.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Ledger Lines Background Effect */}
          <div className="absolute inset-0 pointer-events-none -z-10 pt-[168px]" 
               style={{ background: 'repeating-linear-gradient(transparent, transparent 47px, #e2e8f0 48px)' }}>
          </div>
        </div>
      </div>
    </div>
  );
};
