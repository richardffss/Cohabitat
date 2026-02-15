import React, { useState, useEffect } from 'react';
import { ShoppingItem, User } from '../types';
import { Trash2, Thermometer, RotateCcw, Cookie, Package, Apple, Fish, Sparkles, Loader2 } from 'lucide-react';
import { categorizeShoppingItem } from '../services/geminiService';

interface ShoppingListProps {
  items: ShoppingItem[];
  users: User[];
  addItem: (item: ShoppingItem) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, users, addItem, toggleItem, deleteItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [isStocking, setIsStocking] = useState(false);
  const [columns, setColumns] = useState(4); // Default shelf capacity

  useEffect(() => {
    const handleResize = () => {
        const width = window.innerWidth;
        if (width < 640) { // sm
            setColumns(2);
        } else if (width < 1024) { // lg
            setColumns(3);
        } else {
            setColumns(4);
        }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isStocking) return;
    
    setIsStocking(true);
    
    const category = await categorizeShoppingItem(newItemName);

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      addedBy: users[0].id,
      completed: false,
      category: category
    };

    addItem(newItem);
    setNewItemName('');
    setIsStocking(false);
  };

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  // Group active items into dynamic shelves
  const shelves = [];
  for (let i = 0; i < activeItems.length; i += columns) {
      shelves.push(activeItems.slice(i, i + columns));
  }
  // Always show at least one empty shelf if empty
  if (shelves.length === 0) shelves.push([]);

  const getCategoryDetails = (category: string) => {
    switch (category) {
        case 'Snacks': return { color: 'bg-yellow-400', icon: <Cookie size={20} className="text-yellow-900" /> };
        case 'Canned Goods': return { color: 'bg-slate-300', icon: <Package size={20} className="text-slate-800" /> };
        case 'Fresh Produce': return { color: 'bg-green-500', icon: <Apple size={20} className="text-green-900" /> };
        case 'Meat and Fish': return { color: 'bg-rose-500', icon: <Fish size={20} className="text-rose-100" /> };
        case 'Household Items': return { color: 'bg-indigo-400', icon: <Sparkles size={20} className="text-white" /> };
        default: return { color: 'bg-blue-300', icon: <Package size={20} className="text-blue-900" /> };
    }
  };

  return (
    <div className="h-full flex flex-col relative">
       
       {/* Top Control Panel (Digital Display) */}
       <div className="bg-slate-900 p-4 shadow-lg z-20 sticky top-0 border-b border-slate-700">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="flex items-center gap-4 text-cyan-400 justify-between md:justify-start w-full md:w-auto">
                   <div className="flex items-center gap-2">
                       <Thermometer size={24} />
                       <div>
                           <div className="text-2xl md:text-3xl font-mono font-bold leading-none">34°F</div>
                           <div className="text-[10px] uppercase tracking-widest opacity-70">Optimal</div>
                       </div>
                   </div>
                   {/* Mobile only status */}
                   <div className="md:hidden text-xs text-cyan-600 font-mono animate-pulse">Running</div>
              </div>

              {/* Digital Input */}
              <form onSubmit={handleAdd} className="flex-1 w-full flex gap-2">
                  <div className="relative flex-1">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add item..."
                        disabled={isStocking}
                        className="w-full bg-slate-800 text-cyan-100 p-3 rounded-md border border-slate-700 focus:border-cyan-500 outline-none font-mono tracking-wide placeholder:text-slate-600 disabled:opacity-50 text-sm md:text-base"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
                  </div>
                  <button
                    type="submit"
                    disabled={isStocking}
                    className="bg-cyan-600 text-white px-4 md:px-6 rounded-md font-bold uppercase tracking-wider text-xs hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {isStocking ? <Loader2 size={16} className="animate-spin" /> : 'Stock'}
                  </button>
              </form>
          </div>
       </div>

       {/* Main Interior Area */}
       <div className="flex-1 overflow-y-auto p-2 md:p-8 space-y-6 md:space-y-8 pb-40">
            
            {/* Active Shelves */}
            {shelves.map((shelfItems, idx) => (
                <div key={idx} className="relative pt-8 pb-1 px-2 md:px-4">
                    {/* Items on Shelf */}
                    <div className="flex justify-center md:justify-start flex-wrap gap-4 md:gap-8 items-end relative z-10 px-2 md:px-12 min-h-[100px] md:min-h-[120px]">
                        {shelfItems.map(item => {
                             const adder = users.find(u => u.id === item.addedBy);
                             const { color, icon } = getCategoryDetails(item.category);
                             
                             return (
                                <div key={item.id} className="group relative flex flex-col items-center w-24 md:w-32 cursor-pointer transition-transform hover:-translate-y-1" onClick={() => toggleItem(item.id)}>
                                    
                                    {/* The "Product" */}
                                    <div className={`w-full h-24 md:h-32 ${color} rounded-t-lg rounded-b-sm shadow-md relative flex items-center justify-center border-b-4 border-black/10 overflow-hidden`}>
                                        {/* Glossy Reflection */}
                                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent skew-x-12" />
                                        
                                        {/* Category Icon Badge */}
                                        <div className="absolute top-2 left-2 p-1 bg-white/30 rounded-full shadow-sm backdrop-blur-sm">
                                            {icon}
                                        </div>

                                        {/* Label */}
                                        <div className="bg-white/90 w-11/12 p-1 md:p-2 text-center shadow-sm rotate-1 mt-4">
                                            <p className="font-bold text-slate-800 text-xs md:text-sm leading-tight break-words line-clamp-2">{item.name}</p>
                                        </div>

                                        {/* Avatar Badge */}
                                        <div className="absolute bottom-1 right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border border-white overflow-hidden shadow-sm">
                                            <img src={adder?.avatar} alt={adder?.name} className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    {/* Reflection on Shelf */}
                                    <div className={`w-[90%] h-4 ${color} opacity-20 blur-sm scale-y-[-1] absolute -bottom-4`} />
                                </div>
                             )
                        })}
                        {shelfItems.length === 0 && (
                            <div className="w-full h-24 flex items-center justify-center opacity-30 text-slate-400 font-mono text-sm">
                                Empty Shelf
                            </div>
                        )}
                    </div>

                    {/* The Glass Shelf */}
                    <div className="absolute bottom-0 left-0 w-full h-3 md:h-4 bg-gradient-to-r from-cyan-100/10 via-cyan-100/30 to-cyan-100/10 border-t border-b border-white/40 shadow-[0_5px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm" />
                </div>
            ))}

            <div className="h-10" /> {/* Spacer */}
       </div>

       {/* Crisper Drawer (Completed Items) */}
       <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-cyan-900/10 to-transparent z-10 pointer-events-none flex flex-col justify-end">
            <div className="bg-white/40 backdrop-blur-md h-full max-h-32 md:max-h-48 border-t-2 border-white/50 p-3 md:p-4 pointer-events-auto overflow-y-auto transition-transform hover:bg-white/60">
                <div className="flex items-center gap-2 mb-2 sticky top-0">
                    <div className="w-full h-1 bg-slate-300 rounded-full max-w-[40px] mx-auto mb-2" /> {/* Handle */}
                </div>
                <h3 className="text-center text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">Crisper Drawer (Completed)</h3>
                
                <div className="flex flex-wrap gap-2 justify-center pb-4">
                    {completedItems.map(item => {
                        const { icon } = getCategoryDetails(item.category);
                        return (
                            <div key={item.id} className="flex items-center gap-2 bg-white/70 pl-2 pr-2 py-1 rounded-full border border-white/50 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                                <div className="scale-75 opacity-70 hidden md:block">{icon}</div>
                                <span className="text-xs md:text-sm line-through text-slate-500 max-w-[100px] truncate">{item.name}</span>
                                <div className="flex gap-1 ml-1">
                                    <button onClick={() => toggleItem(item.id)} className="text-slate-400 hover:text-green-600"><RotateCcw size={12} /></button>
                                    <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        )
                    })}
                    {completedItems.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Drawer is clean</span>
                    )}
                </div>
            </div>
       </div>

    </div>
  );
};