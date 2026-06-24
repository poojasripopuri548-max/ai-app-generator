// Mock AI Service - Simulates streaming AI code generation
// Replace this with actual OpenAI API integration when you have an API key

export class AIService {
  private messageHistory: { role: "user" | "assistant"; content: string }[] = [];

  constructor() {
    this.messageHistory = [];
  }

  addMessage(role: "user" | "assistant", content: string) {
    this.messageHistory.push({ role, content });
  }

  getHistory() {
    return this.messageHistory;
  }

  clearHistory() {
    this.messageHistory = [];
  }

  // Generate a streaming response that simulates AI code generation
  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    this.addMessage("user", prompt);

    const response = this.generateMockResponse(prompt);
    // Split by characters for smooth streaming
    const chars = response.split("");

    for (let i = 0; i < chars.length; i += 3) {
      yield chars.slice(i, i + 3).join("");
      // Simulate network delay for realistic streaming
      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 25));
    }

    this.addMessage("assistant", response);
  }

  private generateMockResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes("login") || promptLower.includes("sign in") || promptLower.includes("authentication")) {
      return this.generateLoginCode();
    }
    if (promptLower.includes("blue") || promptLower.includes("color") || promptLower.includes("theme")) {
      return this.generateThemeCode();
    }
    if (promptLower.includes("dashboard")) {
      return this.generateDashboardCode();
    }
    if (promptLower.includes("notification") || promptLower.includes("email")) {
      return this.generateNotificationCode();
    }
    if (promptLower.includes("button") || promptLower.includes("form") || promptLower.includes("input")) {
      return this.generateComponentCode();
    }
    if (promptLower.includes("table") || promptLower.includes("grid") || promptLower.includes("list")) {
      return this.generateTableCode();
    }
    if (promptLower.includes("api") || promptLower.includes("endpoint") || promptLower.includes("route")) {
      return this.generateApiCode();
    }
    if (promptLower.includes("chart") || promptLower.includes("graph") || promptLower.includes("analytics")) {
      return this.generateChartCode();
    }
    
    return this.generateDefaultApp(prompt);
  }

  private codeBlock(code: string, language: string = "tsx"): string {
    return "```" + language + "\n" + code + "\n```";
  }

  private generateLoginCode(): string {
    return this.codeBlock(`import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
  theme?: 'light' | 'dark';
}

export function LoginForm({ onLogin, theme = 'light' }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
    onLogin?.(email, password);
    setLoading(false);
  }

  return (
    <div className={\`min-h-screen flex items-center justify-center \${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    } px-4\`}>
      <div className={\`w-full max-w-md rounded-2xl shadow-2xl p-8 \${
        isDark ? 'bg-gray-800' : 'bg-white'
      }\`}>
        <div className="text-center mb-8">
          <h1 className={\`text-3xl font-bold \${
            isDark ? 'text-white' : 'text-gray-900'
          }\`}>Welcome Back</h1>
          <p className={\`mt-2 \${isDark ? 'text-gray-400' : 'text-gray-600'}\`}>
            Sign in to continue
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={\`block text-sm font-medium mb-1.5 \${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }\`}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={\`w-full pl-10 pr-4 py-2.5 rounded-lg border \${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 outline-none transition\`}
              />
            </div>
          </div>
          <div>
            <label className={\`block text-sm font-medium mb-1.5 \${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }\`}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className={\`w-full pl-10 pr-4 py-2.5 rounded-lg border \${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 outline-none transition\`}
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}`);
  }

  private generateThemeCode(): string {
    return this.codeBlock(`// Theme Configuration
export const appTheme = {
  colors: {
    primary: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
      300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
      600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
      300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
      600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
    },
  },
  borderRadius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
};

// TailwindCSS usage:
// bg-primary-500, text-primary-700, border-secondary-200, etc.
// Import: import { appTheme } from './theme';`);
  }

  private generateDashboardCode(): string {
    return this.codeBlock(`import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const stats = [
  { icon: DollarSign, label: 'Total Revenue', value: '$24,780', trend: '+12.5%', color: 'blue' },
  { icon: Users, label: 'Active Users', value: '1,482', trend: '+8.2%', color: 'green' },
  { icon: Activity, label: 'Orders', value: '384', trend: '-3.1%', color: 'orange' },
  { icon: TrendingUp, label: 'Growth Rate', value: '+23%', trend: '+15.3%', color: 'purple' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is your overview.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className={\`p-2 rounded-lg w-fit \${colorMap[stat.color]}\`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={\`text-sm font-medium mt-1 \${
              stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }\`}>{stat.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`);
  }

  private generateNotificationCode(): string {
    return this.codeBlock(`import { useState } from 'react';
import { Bell, Mail, X, Check, Trash2 } from 'lucide-react';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Welcome!', message: 'Account created successfully.', read: false },
    { id: '2', title: 'New Update', message: 'Version 2.0 is available.', read: false },
    { id: '3', title: 'Security Alert', message: 'New login detected.', read: true },
  ]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const unreadCount = notifications.filter(n => !n.read).length;

  function sendTestEmail() {
    alert('Test email sent' + (emailAlerts ? ' (email alerts enabled)' : ''));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <button onClick={sendTestEmail}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <Mail className="h-4 w-4" />
          Send Test Email
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={\`p-4 rounded-xl border \${
            n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
          } flex items-start justify-between gap-3\`}>
            <div className="flex-1">
              <p className={\`font-medium \${n.read ? 'text-gray-700' : 'text-gray-900'}\`}>{n.title}</p>
              <p className="text-sm text-gray-500 mt-1">{n.message}</p>
            </div>
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" checked={emailAlerts}
          onChange={e => setEmailAlerts(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label className="text-sm text-gray-600">Send email notifications</label>
      </div>
    </div>
  );
}`);
  }

  private generateComponentCode(): string {
    return this.codeBlock(`import { useState } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export function Button({ variant = 'primary', size = 'md', children, onClick, className = '' }: ButtonProps) {
  return (
    <button onClick={onClick}
      className={\`inline-flex items-center justify-center gap-2 font-medium transition-all
        \${variants[variant]} \${sizes[size]} \${className}
      \`}
    >
      {children}
    </button>
  );
}

interface InputProps {
  label?: string;
  error?: string;
  [key: string]: any;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input className={\`w-full px-3 py-2 rounded-lg border border-gray-300
        focus:ring-2 focus:ring-blue-500 outline-none transition text-sm
        \${error ? 'border-red-300' : ''} \${className}\`} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}`);
  }

  private generateTableCode(): string {
    return this.codeBlock(`import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column { key: string; label: string; }
interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  pageSize?: number;
}

export function DataTable({ columns, data, pageSize = 5 }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      columns.some(col => String(item[col.key]).toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-500">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paged.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700">{row[col.key]}</td>
              ))}
            </tr>
          ))}
          {paged.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">No results</td></tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}`);
  }

  private generateApiCode(): string {
    return this.codeBlock(`import { NextRequest, NextResponse } from 'next/server';

let items: Array<{ id: string; name: string; createdAt: Date }> = [];

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

  let filtered = items;
  if (search) {
    filtered = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }

  const start = (page - 1) * limit;
  return NextResponse.json({
    data: filtered.slice(start, start + limit),
    pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const newItem = { id: crypto.randomUUID(), name: body.name, createdAt: new Date() };
    items.unshift(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  items = items.filter(item => item.id !== body.id);
  return NextResponse.json({ message: 'Deleted' });
}`, 'typescript');
  }

  private generateChartCode(): string {
    return this.codeBlock(`const data = [
  { month: 'Jan', sales: 4000, profit: 2400, customers: 200 },
  { month: 'Feb', sales: 3000, profit: 1398, customers: 280 },
  { month: 'Mar', sales: 5000, profit: 3800, customers: 350 },
  { month: 'Apr', sales: 4780, profit: 3908, customers: 310 },
  { month: 'May', sales: 5890, profit: 4800, customers: 420 },
  { month: 'Jun', sales: 6390, profit: 5100, customers: 480 },
];

export function Analytics() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">
            {data.reduce((s, r) => s + r.sales, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-3xl font-bold text-green-600">
            {data.reduce((s, r) => s + r.profit, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-blue-600">
            {data.reduce((s, r) => s + r.customers, 0).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="space-y-3">
          {data.map(row => (
            <div key={row.month} className="flex items-center gap-4">
              <span className="w-10 text-sm font-medium text-gray-600">{row.month}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: (row.sales / 7000 * 100) + '%' }} />
              </div>
              <span className="text-sm font-medium text-gray-700 w-16 text-right">
                {row.sales.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`);
  }

  private generateDefaultApp(prompt: string): string {
    return this.codeBlock(`import { useState } from 'react';

export function GeneratedApp() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  function addItem() {
    if (input.trim()) {
      setItems(prev => [...prev, input.trim()]);
      setInput('');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Generated App</h1>
          <p className="text-xl text-gray-600">Built with AI App Generator</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Counter</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setCount(c => Math.max(0, c - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg transition">-</button>
                <span className="text-3xl font-bold text-blue-600 min-w-[3rem] text-center">{count}</span>
                <button onClick={() => setCount(c => c + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg transition">+</button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Quick Add</h3>
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  placeholder="Add an item..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <button onClick={addItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Add</button>
              </div>
            </div>
          </div>
          {items.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-3">Items ({items.length})</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{item}</span>
                    <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 text-sm font-medium">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`);
  }
}