// AI Service - Generates JSON config + code from natural language prompts
// Replace with actual OpenAI API integration when you have an API key

export type GenerationStep = {
  text: string;
  type: "generating" | "progress" | "done" | "error";
};

export type AIResponse = {
  code: string;
  json: string;
  message: string;
};

export class AIService {
  private messageHistory: { role: "user" | "assistant"; content: string }[] = [];
  private currentAppJson: any = null;

  constructor() {
    this.currentAppJson = this.getBaseApp();
  }

  getHistory() {
    return this.messageHistory;
  }

  clearHistory() {
    this.messageHistory = [];
    this.currentAppJson = this.getBaseApp();
  }

  private getBaseApp() {
    return {
      appName: "My App",
      description: "Generated application",
      theme: "light",
      primaryColor: "#3b82f6",
      pages: [{ id: "home", title: "Home", type: "dashboard" }],
      components: [],
      entities: [],
      workflows: [],
    };
  }

  // Process a prompt, calling onStep for each progress update, and returning the final result
  async processPrompt(
    prompt: string,
    onStep: (step: GenerationStep) => void
  ): Promise<AIResponse> {
    this.messageHistory.push({ role: "user", content: prompt });

    const promptLower = prompt.toLowerCase();
    let response: AIResponse;

    if (promptLower.includes("login") || promptLower.includes("sign in")) {
      response = this.handleAddLogin(prompt, onStep);
    } else if (promptLower.includes("blue") || promptLower.includes("color") || promptLower.includes("theme")) {
      response = this.handleChangeColor(prompt, onStep);
    } else if (promptLower.includes("dashboard")) {
      response = this.handleAddDashboard(prompt, onStep);
    } else if (promptLower.includes("notification") || promptLower.includes("email")) {
      response = this.handleAddNotifications(prompt, onStep);
    } else if (promptLower.includes("table") || promptLower.includes("grid") || promptLower.includes("list")) {
      response = this.handleAddTable(prompt, onStep);
    } else if (promptLower.includes("chart") || promptLower.includes("graph") || promptLower.includes("analytics")) {
      response = this.handleAddCharts(prompt, onStep);
    } else if (promptLower.includes("button") || promptLower.includes("form") || promptLower.includes("input")) {
      response = this.handleAddComponent(prompt, onStep);
    } else if (promptLower.includes("api") || promptLower.includes("endpoint")) {
      response = this.handleAddApi(prompt, onStep);
    } else {
      response = this.handleGeneralPrompt(prompt, onStep);
    }

    this.messageHistory.push({ role: "assistant", content: response.message });
    return response;
  }

  private async emitSteps(steps: GenerationStep[], onStep: (step: GenerationStep) => void) {
    for (const step of steps) {
      onStep(step);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 600));
    }
  }

  private handleAddLogin(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    if (!this.currentAppJson.pages.find((p: any) => p.id === "login")) {
      this.currentAppJson.pages.push({ id: "login", title: "Login", type: "form", entity: "users" });
    }

    if (!this.currentAppJson.entities.find((e: any) => e.name === "users")) {
      this.currentAppJson.entities.push({
        name: "users", label: "Users",
        fields: [
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "Password", type: "password", required: true },
          { name: "role", label: "Role", type: "select", options: ["Admin", "User", "Editor"] },
        ],
      });
    }

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: "Creating Login Page...", type: "generating" },
      { text: "Adding form fields (Email, Password)...", type: "progress" },
      { text: "Styling with gradient background...", type: "progress" },
      { text: "✓ Login page generated successfully!", type: "done" },
    ], onStep);

    const code = `import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); setLoading(false); return; }
    await new Promise(r => setTimeout(r, 1000));
    alert('Login successful!');
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl p-8 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}`;

    return {
      code,
      json: JSON.stringify(this.currentAppJson, null, 2),
      message: "✅ Login page created with email/password form, show/hide toggle, validation, and gradient background.",
    };
  }

  private handleChangeColor(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6", green: "#10b981", red: "#ef4444", purple: "#8b5cf6",
      orange: "#f97316", indigo: "#6366f1", pink: "#ec4899", teal: "#14b8a6",
    };
    let colorName = "Blue";
    let color = this.currentAppJson.primaryColor;
    
    for (const [name, hex] of Object.entries(colorMap)) {
      if (prompt.toLowerCase().includes(name)) {
        color = hex;
        colorName = name.charAt(0).toUpperCase() + name.slice(1);
        break;
      }
    }

    this.currentAppJson.primaryColor = color;
    this.currentAppJson.theme = prompt.includes("dark") ? "dark" : "light";

    this.emitSteps([
      { text: `Updating theme...`, type: "generating" },
      { text: `Applying ${colorName} color scheme...`, type: "progress" },
      { text: prompt.includes("dark") ? "Switching to dark mode..." : "Keeping light mode...", type: "progress" },
      { text: `✓ Theme updated to ${colorName}!`, type: "done" },
    ], onStep);

    const code = `export const theme = {
  primaryColor: '${color}',
  mode: '${this.currentAppJson.theme}',
  colors: {
    primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '${color}', 600: '#2563eb', 700: '#1d4ed8' },
    secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569' },
  },
};`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: `🎨 Theme updated to **${colorName}**. Preview updating instantly.` };
  }

  private handleAddDashboard(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    if (!this.currentAppJson.pages.find((p: any) => p.id === "dashboard")) {
      this.currentAppJson.pages.push({ id: "dashboard", title: "Dashboard", type: "dashboard" });
    }

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: "Generating Dashboard...", type: "generating" },
      { text: "Adding Metrics Cards...", type: "progress" },
      { text: "✓ Dashboard added successfully!", type: "done" },
    ], onStep);

    const code = `import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: '$24,780', trend: '+12.5%', color: 'blue' },
    { icon: Users, label: 'Active Users', value: '1,482', trend: '+8.2%', color: 'green' },
    { icon: Activity, label: 'Orders', value: '384', trend: '-3.1%', color: 'orange' },
    { icon: TrendingUp, label: 'Growth Rate', value: '+23%', trend: '+15.3%', color: 'purple' },
  ];

  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600', purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 -mt-4">Welcome back! Here is your overview.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className={\`p-2 rounded-lg w-fit \${colors[s.color]}\`}><s.icon className="h-6 w-6" /></div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={\`text-sm font-medium mt-1 \${s.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}\`}>{s.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: "📊 **Dashboard created!** Revenue, Users, Orders, and Growth metrics with trend indicators." };
  }

  private handleAddNotifications(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    if (!this.currentAppJson.workflows.find((w: any) => w.trigger === "create")) {
      this.currentAppJson.workflows.push({ name: "Email Notification", trigger: "create", action: "notify", message: "New record created." });
    }

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: "Creating Notification workflow...", type: "generating" },
      { text: "Adding email notification logic...", type: "progress" },
      { text: "✓ Email notifications created!", type: "done" },
    ], onStep);

    const code = `import { useState } from 'react';
import { Bell, Mail, Trash2 } from 'lucide-react';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Welcome!', message: 'Account created.', read: false },
    { id: '2', title: 'New Update', message: 'Version 2.0 is available.', read: false },
    { id: '3', title: 'Security Alert', message: 'New login detected.', read: true },
  ]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">{unreadCount} new</span>}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
          <Mail className="h-4 w-4" /> Send Test
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={\`p-4 rounded-xl border \${n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'} flex items-start justify-between gap-3\`}>
            <div className="flex-1">
              <p className={\`font-medium \${n.read ? 'text-gray-700' : 'text-gray-900'}\`}>{n.title}</p>
              <p className="text-sm text-gray-500 mt-1">{n.message}</p>
            </div>
            <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="rounded border-gray-300" />
        <label className="text-sm text-gray-600">Send email notifications</label>
      </div>
    </div>
  );
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: "📬 **Email notifications configured!** Bell, unread badge, email toggle, and test button." };
  }

  private handleAddTable(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    const entityName = prompt.includes("user") ? "users" : prompt.includes("order") ? "orders" : prompt.includes("product") ? "products" : "items";

    if (!this.currentAppJson.entities.find((e: any) => e.name === entityName)) {
      this.currentAppJson.entities.push({
        name: entityName,
        label: entityName.charAt(0).toUpperCase() + entityName.slice(1),
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Pending"] },
          { name: "createdAt", label: "Created", type: "date" },
        ],
      });
    }

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: `Creating ${entityName} data table...`, type: "generating" },
      { text: "Adding search & pagination...", type: "progress" },
      { text: `✓ ${entityName} table created!`, type: "done" },
    ], onStep);

    const code = `import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({ columns, data, pageSize = 5 }: any) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((item: any) => columns.some((col: any) => String(item[col.key]).toLowerCase().includes(search.toLowerCase())));
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            {columns.map((col: any) => <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-500">{col.label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col: any) => <td key={col.key} className="px-4 py-3 text-sm text-gray-700">{row[col.key]}</td>)}
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">No results</td></tr>}
          </tbody>
        </table>
      </div>
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
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: `📋 **${entityName} table added!** Searchable, paginated data table.` };
  }

  private handleAddCharts(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: "Generating Charts...", type: "generating" },
      { text: "Creating metrics and progress bars...", type: "progress" },
      { text: "✓ Analytics dashboard created!", type: "done" },
    ], onStep);

    const code = `const data = [
  { month: 'Jan', sales: 4000, profit: 2400, customers: 200 },
  { month: 'Feb', sales: 3000, profit: 1398, customers: 280 },
  { month: 'Mar', sales: 5000, profit: 3800, customers: 350 },
  { month: 'Apr', sales: 4780, profit: 3908, customers: 310 },
  { month: 'May', sales: 5890, profit: 4800, customers: 420 },
  { month: 'Jun', sales: 6390, profit: 5100, customers: 480 },
];

export function Analytics() {
  const totals = {
    sales: data.reduce((s, r) => s + r.sales, 0),
    profit: data.reduce((s, r) => s + r.profit, 0),
    customers: data.reduce((s, r) => s + r.customers, 0),
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">{totals.sales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-3xl font-bold text-green-600">{totals.profit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-blue-600">{totals.customers.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="space-y-3">
          {data.map(row => (
            <div key={row.month} className="flex items-center gap-4">
              <span className="w-10 text-sm font-medium text-gray-600">{row.month}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: (row.sales / 7000 * 100) + '%' }} />
              </div>
              <span className="text-sm font-medium text-gray-700 w-16 text-right">{row.sales.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: "📈 **Analytics dashboard created!** Sales, profit, customers with progress bars." };
  }

  private handleAddComponent(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    const variant = prompt.includes("outline") ? "outline" : prompt.includes("ghost") ? "ghost" : "primary";

    this.emitSteps([
      { text: "Analyzing component request...", type: "generating" },
      { text: "Generating customizable component...", type: "generating" },
      { text: `Setting variant to ${variant}...`, type: "progress" },
      { text: `✓ Component created!`, type: "done" },
    ], onStep);

    const code = `interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const sizes = { sm: 'px-3 py-1.5 text-sm rounded-md', md: 'px-4 py-2 text-sm rounded-lg', lg: 'px-6 py-3 text-base rounded-lg' };

export function Button({ variant = '${variant}', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}
      className={\`inline-flex items-center justify-center gap-2 font-medium transition-all \${variants[variant]} \${sizes[size]}\`}>
      {children}
    </button>
  );
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: `🧩 **Component created!** Variant: ${variant}. Ready to use.` };
  }

  private handleAddApi(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    const endpoint = prompt.includes("user") ? "users" : prompt.includes("product") ? "products" : "items";

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: `Creating /api/${endpoint} endpoint...`, type: "generating" },
      { text: "Adding GET with search & POST with validation...", type: "progress" },
      { text: `✓ API endpoint /api/${endpoint} created!`, type: "done" },
    ], onStep);

    const code = `import { NextRequest, NextResponse } from 'next/server';

let items: Array<{ id: string; name: string; createdAt: Date }> = [];

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  let filtered = items;
  if (search) filtered = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const start = (page - 1) * limit;
  return NextResponse.json({ data: filtered.slice(start, start + limit), pagination: { page, limit, total: filtered.length } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const item = { id: crypto.randomUUID(), name: body.name, createdAt: new Date() };
    items.unshift(item);
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: `🔌 **API endpoint /api/${endpoint} created!** GET (search, pagination) + POST.` };
  }

  private handleGeneralPrompt(prompt: string, onStep: (s: GenerationStep) => void): AIResponse {
    const name = prompt.split(" ").slice(0, 3).join(" ").replace(/^(add|create|make|build)\s+/i, "");
    if (name && name.length > 2) this.currentAppJson.appName = name;

    this.emitSteps([
      { text: "Analyzing request...", type: "generating" },
      { text: `Creating ${this.currentAppJson.appName}...`, type: "generating" },
      { text: "Building interactive UI...", type: "progress" },
      { text: "✓ Application generated successfully!", type: "done" },
    ], onStep);

    const code = `import { useState } from 'react';

export function GeneratedApp() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">${this.currentAppJson.appName}</h1>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-8 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button onClick={() => setCount(c => Math.max(0, c - 1))}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg transition">-</button>
            <span className="text-3xl font-bold text-blue-600 min-w-[3rem] text-center">{count}</span>
            <button onClick={() => setCount(c => c + 1)}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg transition">+</button>
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setItems(prev => input.trim() ? [...prev, input.trim()] : prev) && setInput('')}
              placeholder="Add item..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={() => { if(input.trim()) { setItems(prev => [...prev, input.trim()]); setInput(''); } }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add</button>
          </div>
          {items.length > 0 && (
            <div className="mt-6 space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{item}</span>
                  <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

    return { code, json: JSON.stringify(this.currentAppJson, null, 2), message: `✨ **${this.currentAppJson.appName}** created! Counter + todo list interactive demo.` };
  }
}