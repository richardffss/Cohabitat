export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // User ID
  date: string;
  category: 'Food' | 'Utilities' | 'Rent' | 'Supplies' | 'Entertainment' | 'Other';
  splitAmong: string[]; // Array of User IDs
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  category: Expense['category'];
  splitAmong: string[];
  frequency: 'Weekly' | 'Monthly';
  startDate: string;
}

export interface Chore {
  id: string;
  title: string;
  assignedTo: string; // User ID
  dueDate: string;
  completed: boolean;
  frequency: 'Once' | 'Daily' | 'Weekly' | 'Monthly';
}

export interface ShoppingItem {
  id: string;
  name: string;
  addedBy: string; // User ID
  completed: boolean;
  category: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  date: string;
  type: 'General' | 'Urgent' | 'Party' | 'Maintenance';
  position?: Position;
  zIndex?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO String
  time: string;
  type: 'Household' | 'Personal' | 'Maintenance';
  createdBy: string; // User ID
  description?: string;
  reminder: boolean;
}

export interface Poll {
  id: string;
  question: string;
  createdBy: string;
  createdAt: string;
  votes: Record<string, 'yes' | 'no'>; // UserId -> Vote
  status: 'open' | 'closed';
  position?: Position;
  zIndex?: number;
}

// Global state for the Expense Ledger's position on the board
export interface LedgerState {
    position: Position;
    zIndex: number;
}

export type ViewState = 'dashboard' | 'corkboard' | 'chores' | 'shopping' | 'calendar';
