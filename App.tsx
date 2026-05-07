/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Coins, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Leaf,
  ChevronRight,
  Search,
  MoreVertical,
  Activity,
  Trophy,
  Copy,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Agent {
  id: string;
  name: string;
  phone: string;
  city: string;
  township: string;
  platform: string;
  status: 'Active' | 'Slow' | 'Inactive';
  fb: string;
  followers: number;
  source: string;
  notes: string;
  joinDate: string;
}

interface SaleEntry {
  id: string;
  agentId: string;
  month: string;
  orders: number;
  sales: number;
  lastSales: number;
  date: string;
}

interface RevenueEntry {
  id: string;
  month: string;
  gross: number;
  stock: number;
  ads: number;
  ops: number;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  open: number;
  sold: number;
  cost: number;
  reorder: number;
}

interface Issue {
  id: string;
  agentId: string | null;
  desc: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  resolution: string;
  date: string;
}

type TabType = 'dashboard' | 'agents' | 'sales' | 'revenue' | 'inventory' | 'roi' | 'issues' | 'report';

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'gray' | 'green' | 'red' | 'blue' | 'amber' | 'purple' }) => {
  const styles = {
    gray: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-700 font-medium',
    red: 'bg-rose-100 text-rose-700 font-medium',
    blue: 'bg-blue-100 text-blue-700 font-medium',
    amber: 'bg-amber-100 text-amber-700 font-medium',
    purple: 'bg-purple-100 text-purple-700 font-medium',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [costPerAgent, setCostPerAgent] = useState<number>(500);

  // Form states
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Load data
  useEffect(() => {
    const keys = ['gn_agents', 'gn_sales', 'gn_revenue', 'gn_inventory', 'gn_issues', 'gn_cost_per_agent'];
    const loadedData: any = {};
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) loadedData[key] = JSON.parse(val);
    });

    if (loadedData.gn_agents) setAgents(loadedData.gn_agents);
    if (loadedData.gn_sales) setSales(loadedData.gn_sales);
    if (loadedData.gn_revenue) setRevenue(loadedData.gn_revenue);
    if (loadedData.gn_inventory) setInventory(loadedData.gn_inventory);
    if (loadedData.gn_issues) setIssues(loadedData.gn_issues);
    if (loadedData.gn_cost_per_agent) setCostPerAgent(loadedData.gn_cost_per_agent);
  }, []);

  // Sync data
  useEffect(() => { localStorage.setItem('gn_agents', JSON.stringify(agents)); }, [agents]);
  useEffect(() => { localStorage.setItem('gn_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('gn_revenue', JSON.stringify(revenue)); }, [revenue]);
  useEffect(() => { localStorage.setItem('gn_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('gn_issues', JSON.stringify(issues)); }, [issues]);
  useEffect(() => { localStorage.setItem('gn_cost_per_agent', JSON.stringify(costPerAgent)); }, [costPerAgent]);

  // --- Helpers ---

  const fmtTHB = (n: number) => Math.round(n).toLocaleString('en-US');

  const getAgent = (id: string) => agents.find(a => a.id === id);

  const calculateROI = (agent: Agent) => {
    const agentTotalSales = sales.filter(s => s.agentId === agent.id).reduce((sum, s) => sum + s.sales, 0);
    const commission = agentTotalSales * 0.2;
    const net = commission - costPerAgent;
    return costPerAgent > 0 ? (net / costPerAgent) * 100 : 0;
  };

  const dashboardMetrics = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.sales, 0);
    const totalCommission = totalSales * 0.2;
    const totalNetProfit = revenue.reduce((sum, r) => sum + (r.gross * 0.2 - r.ads - r.ops), 0);
    const totalOrders = sales.reduce((sum, s) => sum + s.orders, 0);
    const totalStockValue = inventory.reduce((sum, i) => sum + ((i.open - i.sold) * i.cost), 0);
    const activeIssueCount = issues.filter(i => i.status !== 'Resolved').length;

    return {
      totalSales,
      totalCommission,
      totalNetProfit,
      totalOrders,
      totalStockValue,
      activeIssueCount,
      activeAgentCount: agents.filter(a => a.status === 'Active').length
    };
  }, [sales, revenue, inventory, issues, agents]);

  const topAgents = useMemo(() => {
    const agentTotals: Record<string, number> = {};
    sales.forEach(s => {
      agentTotals[s.agentId] = (agentTotals[s.agentId] || 0) + s.sales;
    });
    return Object.entries(agentTotals)
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [sales]);

  const stockAlerts = useMemo(() => {
    return inventory.filter(i => (i.open - i.sold) <= i.reorder);
  }, [inventory]);

  // --- Handlers ---

  const handleCopyReport = () => {
    const now = new Date().toLocaleDateString('en-GB');
    const text = `GN AGENT REPORT — ${now}\n\n` +
      `Active Agents: ${dashboardMetrics.activeAgentCount}\n` +
      `Total Revenue: ${fmtTHB(dashboardMetrics.totalSales)} THB\n` +
      `Your Commission (20%): ${fmtTHB(dashboardMetrics.totalCommission)} THB\n` +
      `Net Profit: ${fmtTHB(dashboardMetrics.totalNetProfit)} THB\n` +
      `Total Orders: ${dashboardMetrics.totalOrders}\n` +
      `Open Issues: ${dashboardMetrics.activeIssueCount}`;
    
    navigator.clipboard.writeText(text).then(() => alert('Report copied to clipboard!'));
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'City', 'Platform', 'Status', 'Followers', 'Join Date'];
    const rows = agents.map(a => [a.id, a.name, a.phone, a.city, a.platform, a.status, a.followers, a.joinDate]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gn_agents_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  // --- Views ---

  const SidebarButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-3 w-full text-sm font-medium transition-colors border-r-2 ${
        activeTab === tab 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-500' 
          : 'text-slate-500 hover:text-slate-900 border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Leaf size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">GN Agent Tracker</h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Click Boost X × Ganjah Nation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="green">{dashboardMetrics.activeAgentCount} active agents</Badge>
          <button 
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:block overflow-y-auto">
          <div className="py-4">
            <p className="px-5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Principal</p>
            <SidebarButton tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarButton tab="agents" icon={Users} label="Agent Directory" />
            
            <p className="px-5 mt-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Commercial</p>
            <SidebarButton tab="sales" icon={BarChart3} label="Monthly Sales" />
            <SidebarButton tab="revenue" icon={Coins} label="Revenue & Profit" />
            <SidebarButton tab="inventory" icon={Package} label="Inventory Stock" />
            
            <p className="px-5 mt-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Analysis</p>
            <SidebarButton tab="roi" icon={TrendingUp} label="ROI Analysis" />
            <SidebarButton tab="issues" icon={AlertTriangle} label="Issues Log" />
            <SidebarButton tab="report" icon={FileText} label="Executive Report" />
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 scrollbar-hide">
          {(['dashboard', 'agents', 'sales', 'revenue', 'inventory', 'roi', 'issues', 'report'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* --- DASHBOARD TAB --- */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-5 flex flex-col justify-between h-32 border-l-4 border-l-emerald-500">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</p>
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-black text-slate-900">{fmtTHB(dashboardMetrics.totalSales)}</h2>
                        <div className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg"><TrendingUp size={16} /></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Accumulated gross THB</p>
                    </Card>
                    <Card className="p-5 flex flex-col justify-between h-32 border-l-4 border-l-blue-500">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Earnings (20%)</p>
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-black text-slate-900">{fmtTHB(dashboardMetrics.totalCommission)}</h2>
                        <div className="text-blue-600 bg-blue-50 p-1.5 rounded-lg"><Coins size={16} /></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Direct commission share</p>
                    </Card>
                    <Card className="p-5 flex flex-col justify-between h-32 border-l-4 border-l-purple-500">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Profit</p>
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-black text-slate-900">{fmtTHB(dashboardMetrics.totalNetProfit)}</h2>
                        <div className="text-purple-600 bg-purple-50 p-1.5 rounded-lg"><TrendingUp size={16} /></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium text-emerald-600">After operating costs</p>
                    </Card>
                    <Card className="p-5 flex flex-col justify-between h-32 border-l-4 border-l-amber-500">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Issues</p>
                      <div className="flex items-baseline justify-between">
                        <h2 className={`text-2xl font-black ${dashboardMetrics.activeIssueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {dashboardMetrics.activeIssueCount}
                        </h2>
                        <div className={`p-1.5 rounded-lg ${dashboardMetrics.activeIssueCount > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-50'}`}>
                          <AlertTriangle size={16} />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Pending resolutions</p>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Top Performing Agents</h3>
                        <Users size={16} className="text-slate-400" />
                      </div>
                      <div className="p-5 space-y-5">
                        {topAgents.length > 0 ? topAgents.map((entry, idx) => {
                          const agent = getAgent(entry.id);
                          const percentage = (entry.total / topAgents[0].total) * 100;
                          return (
                            <div key={entry.id} className="group cursor-default">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 w-4">0{idx + 1}</span>
                                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{agent?.name || entry.id}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-900">{fmtTHB(entry.total)} <span className="text-[10px] font-medium text-slate-400">THB</span></span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                                  className="h-full bg-emerald-500 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center py-10">
                            <Activity size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">No sales data recorded yet.</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card>
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2"><Package size={16} className="text-emerald-500" /> Critical Stock Alerts</h3>
                        <Badge variant={stockAlerts.length > 0 ? 'red' : 'green'}>{stockAlerts.length} issues</Badge>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                        {stockAlerts.length > 0 ? stockAlerts.map(item => {
                          const remaining = item.open - item.sold;
                          const isCritical = remaining <= item.reorder;
                          return (
                            <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.unit}</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-bold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                                  {remaining} left
                                </div>
                                <p className="text-[10px] font-bold text-slate-400">THR: {item.reorder}</p>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center py-12">
                            <Check size={32} className="mx-auto text-emerald-200 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">All inventory items are stocked.</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold flex items-center gap-2"><Activity size={16} className="text-slate-400" /> Recent System Activity</h3>
                    </div>
                    <div className="p-0">
                      {issues.slice(-4).reverse().map((issue) => (
                        <div key={issue.id} className="px-5 py-4 border-b border-slate-50 last:border-0 flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            issue.severity === 'High' ? 'bg-rose-50 text-rose-500' : 
                            issue.severity === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 font-medium truncate">
                              <span className="font-bold">{getAgent(issue.agentId || '')?.name || 'General'}</span>: {issue.desc}
                            </p>
                            <p className="text-[10px] text-slate-400">{issue.date} • {issue.severity} Priority</p>
                          </div>
                          <Badge variant={issue.status === 'Resolved' ? 'green' : issue.status === 'In Progress' ? 'amber' : 'red'}>
                            {issue.status}
                          </Badge>
                        </div>
                      ))}
                      {issues.length === 0 && <p className="p-10 text-center text-xs text-slate-400 font-medium">No activity log yet.</p>}
                    </div>
                  </Card>
                </div>
              )}

              {/* --- AGENTS TAB --- */}
              {activeTab === 'agents' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Agent Directory</h2>
                      <p className="text-xs text-slate-500 font-medium">Manage and track your recruitment pipeline</p>
                    </div>
                    <button 
                      onClick={() => { setEditingAgent(null); setShowAgentForm(true); }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Recruit New Agent
                    </button>
                  </div>

                  {showAgentForm && (
                    <Card className="border-t-4 border-t-emerald-500">
                      <form className="p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: any = Object.fromEntries(formData.entries());
                        
                        const newAgent: Agent = {
                          id: editingAgent?.id || `AG${Math.floor(Math.random() * 10000)}`,
                          name: data.name,
                          phone: data.phone,
                          city: data.city,
                          township: data.township,
                          platform: data.platform,
                          status: data.status,
                          fb: data.fb,
                          followers: parseInt(data.followers) || 0,
                          source: data.source,
                          notes: data.notes,
                          joinDate: editingAgent?.joinDate || new Date().toISOString().slice(0, 10)
                        };

                        if (editingAgent) {
                          setAgents(agents.map(a => a.id === editingAgent.id ? newAgent : a));
                        } else {
                          setAgents([...agents, newAgent]);
                        }
                        setShowAgentForm(false);
                      }}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black">{editingAgent ? 'Edit Agent Profile' : 'Recruit New Agent'}</h3>
                          <button type="button" onClick={() => setShowAgentForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                            <input name="name" defaultValue={editingAgent?.name} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. Ko Aung Kyaw" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                            <input name="phone" defaultValue={editingAgent?.phone} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="09-xxxxxxxxx" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary City *</label>
                            <input name="city" defaultValue={editingAgent?.city} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. Yangon" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Township</label>
                            <input name="township" defaultValue={editingAgent?.township} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. Insein" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                            <select name="platform" defaultValue={editingAgent?.platform || 'Facebook'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all">
                              <option>Facebook</option>
                              <option>Instagram</option>
                              <option>Telegram</option>
                              <option>TikTok</option>
                              <option>Multi</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Status</label>
                            <select name="status" defaultValue={editingAgent?.status || 'Active'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all">
                              <option value="Active">Active</option>
                              <option value="Slow">Slow</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Social Profile Link</label>
                            <input name="fb" defaultValue={editingAgent?.fb} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="fb.com/username" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Followers</label>
                            <input name="followers" type="number" defaultValue={editingAgent?.followers} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="500" />
                          </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Strategic Notes</label>
                          <textarea name="notes" defaultValue={editingAgent?.notes} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Agent specialities, performance history..." />
                        </div>

                        <div className="mt-8 flex gap-3">
                          <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-50">
                            {editingAgent ? 'Update Profile' : 'Confirm Recruitment'}
                          </button>
                          <button type="button" onClick={() => setShowAgentForm(false)} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 text-slate-600">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </Card>
                  )}

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name & Location</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Followers</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {agents.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4"><span className="font-mono text-[11px] text-slate-400">{a.id}</span></td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-slate-800">{a.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{a.city}{a.township ? `, ${a.township}` : ''}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                  a.platform === 'Facebook' ? 'bg-blue-50 text-blue-600' : 
                                  a.platform === 'Instagram' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {a.platform}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={a.status === 'Active' ? 'green' : a.status === 'Slow' ? 'amber' : 'red'}>
                                  {a.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                {a.followers?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingAgent(a); setShowAgentForm(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                  <button onClick={() => { if(confirm('Delete?')) setAgents(agents.filter(ag => ag.id !== a.id)) }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {agents.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-20 text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                                No agents matching the records.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- SALES TAB --- */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Monthly Sales</h2>
                      <p className="text-xs text-slate-500 font-medium">Record and track agent-driven revenue</p>
                    </div>
                    <button 
                      onClick={() => setShowSalesForm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Log Sale Entry
                    </button>
                  </div>

                  {showSalesForm && (
                    <Card className="border-t-4 border-t-emerald-500 shadow-xl">
                      <form className="p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: any = Object.fromEntries(formData.entries());
                        const newSale: SaleEntry = {
                          id: `S${Date.now()}`,
                          agentId: data.agentId,
                          month: data.month,
                          orders: parseInt(data.orders),
                          sales: parseFloat(data.sales),
                          lastSales: parseFloat(data.lastSales) || 0,
                          date: new Date().toISOString()
                        };
                        setSales([...sales, newSale]);
                        setShowSalesForm(false);
                      }}>
                         <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black italic">Sales Logistics Management</h3>
                          <button type="button" onClick={() => setShowSalesForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Agent *</label>
                            <select name="agentId" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium">
                              <option value="">Choose an agent...</option>
                              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reporting Month *</label>
                            <input name="month" type="month" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Number of Orders *</label>
                            <input name="orders" type="number" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="e.g. 24" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Sales (THB) *</label>
                            <input name="sales" type="number" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-black text-emerald-700 bg-emerald-50/30" placeholder="5000" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Previous Month Sales (THB)</label>
                            <input name="lastSales" type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="4500" />
                          </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                          <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Record Entry</button>
                        </div>
                      </form>
                    </Card>
                  )}

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Orders</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Revenue (THB)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Growth</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Commission (20%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sales.slice().reverse().map((s) => {
                            const agent = getAgent(s.agentId);
                            const growth = s.lastSales ? ((s.sales - s.lastSales) / s.lastSales) * 100 : null;
                            const commission = s.sales * 0.2;
                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{agent?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-medium">{s.month}</td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-800 text-center">{s.orders}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{fmtTHB(s.sales)}</td>
                                <td className="px-6 py-4 text-center">
                                  {growth !== null ? (
                                    <span className={`text-[11px] font-black inline-flex items-center gap-1 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                      {Math.abs(growth).toFixed(1)}%
                                    </span>
                                  ) : <span className="text-[10px] text-slate-300">N/A</span>}
                                </td>
                                <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">+{fmtTHB(commission)}</td>
                              </tr>
                            );
                          })}
                          {sales.length === 0 && <tr><td colSpan={6} className="px-6 py-20 text-center text-xs text-slate-300 font-bold tracking-widest uppercase italic">The ledger is empty.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- INVENTORY TAB --- */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Inventory Management</h2>
                      <p className="text-xs text-slate-500 font-medium">Real-time tracking of product stock and value</p>
                    </div>
                    <button 
                      onClick={() => { setEditingInventory(null); setShowInventoryForm(true); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Add Product
                    </button>
                  </div>

                  {stockAlerts.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-4 animate-pulse">
                      <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-800">Operational Stock Alert</h4>
                        <p className="text-xs text-rose-600 font-medium">Several primary products are below the reorder threshold. Stock fulfillment required.</p>
                      </div>
                    </div>
                  )}

                  {showInventoryForm && (
                     <Card className="border-t-4 border-t-emerald-500 shadow-xl overflow-visible">
                      <form className="p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: any = Object.fromEntries(formData.entries());
                        const newItem: InventoryItem = {
                          id: editingInventory?.id || `INV${Date.now()}`,
                          name: data.name,
                          unit: data.unit,
                          open: parseFloat(data.open),
                          sold: parseFloat(data.sold),
                          cost: parseFloat(data.cost),
                          reorder: parseFloat(data.reorder) || 50
                        };
                        if (editingInventory) {
                          setInventory(inventory.map(i => i.id === editingInventory.id ? newItem : i));
                        } else {
                          setInventory([...inventory, newItem]);
                        }
                        setShowInventoryForm(false);
                      }}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black">{editingInventory ? 'Update Product Details' : 'New Product Registration'}</h3>
                          <button type="button" onClick={() => setShowInventoryForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product / Strain Name *</label>
                            <input name="name" defaultValue={editingInventory?.name} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-bold" placeholder="e.g. Blue Dream" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit of Measurement</label>
                            <select name="unit" defaultValue={editingInventory?.unit || 'gram'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium">
                              <option>gram</option>
                              <option>killogram</option>
                              <option>unit</option>
                              <option>pack</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Opening Stock *</label>
                            <input name="open" type="number" defaultValue={editingInventory?.open} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sold (MTD)</label>
                            <input name="sold" type="number" defaultValue={editingInventory?.sold} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cost / Unit (THB)</label>
                            <input name="cost" type="number" defaultValue={editingInventory?.cost} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reorder Point</label>
                            <input name="reorder" type="number" defaultValue={editingInventory?.reorder || 50} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                          </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                          <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-50">Save Inventory Item</button>
                        </div>
                      </form>
                    </Card>
                  )}

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Remaining</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Cost/Unit</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Stock Value</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inventory.map((item) => {
                            const remaining = item.open - item.sold;
                            const isLow = remaining <= item.reorder * 2 && remaining > item.reorder;
                            const isCritical = remaining <= item.reorder;
                            return (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                <td className="px-6 py-4 text-[11px] font-bold text-slate-400 tracking-widest uppercase">{item.unit}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`text-sm font-black ${isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {remaining}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">{fmtTHB(item.cost)}</td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">{fmtTHB(remaining * item.cost)}</td>
                                <td className="px-6 py-4 text-center">
                                  <Badge variant={isCritical ? 'red' : isLow ? 'amber' : 'green'}>
                                    {isCritical ? 'Reorder' : isLow ? 'Low Stock' : 'Optimized'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingInventory(item); setShowInventoryForm(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => { if(confirm('Delete?')) setInventory(inventory.filter(i => i.id !== item.id)) }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- REPORT TAB --- */}
              {activeTab === 'report' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Executive Report</h2>
                    <button 
                      onClick={handleCopyReport}
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      <Copy size={18} />
                      Share to Telegram / Clipboard
                    </button>
                  </div>

                  <Card className="p-8 space-y-8 bg-slate-50/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-[0.03] select-none pointer-events-none transform rotate-12">
                      <Leaf size={400} />
                    </div>

                    <div className="pb-8 border-b border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                            <Leaf size={28} />
                          </div>
                          <div>
                            <h1 className="text-xl font-black leading-tight">Ganjah Nation Operational Intel</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Strategic Agent Management Insight</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Date</p>
                          <p className="text-sm font-black text-slate-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
                        <p className="text-lg font-black text-slate-900">{fmtTHB(dashboardMetrics.totalSales)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Share (20%)</p>
                        <p className="text-lg font-black text-emerald-600">+{fmtTHB(dashboardMetrics.totalCommission)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Agents</p>
                        <p className="text-lg font-black text-slate-900">{dashboardMetrics.activeAgentCount}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Orders Fulfilled</p>
                        <p className="text-lg font-black text-slate-900">{dashboardMetrics.totalOrders}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Business Health</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Inventory Liquidity</span>
                            <span className="font-black text-slate-900">{fmtTHB(dashboardMetrics.totalStockValue)} THB</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Operational Margin</span>
                            <span className="font-black text-emerald-600">{Math.round((dashboardMetrics.totalNetProfit / (dashboardMetrics.totalCommission || 1)) * 100)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Net Business Profit</span>
                            <span className="font-black text-blue-600">{fmtTHB(dashboardMetrics.totalNetProfit)} THB</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Status Recap</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Total Unresolved Issues</span>
                            <span className={`font-black ${dashboardMetrics.activeIssueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {dashboardMetrics.activeIssueCount} Incident{dashboardMetrics.activeIssueCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Top Monthly Agent</span>
                            <span className="font-black text-slate-900 uppercase font-mono">
                              {topAgents.length > 0 ? (getAgent(topAgents[0].id)?.name || 'N/A') : 'No Data'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 text-center">
                      <div className="inline-block px-4 py-1.5 bg-slate-900 text-[10px] text-white font-black rounded-lg uppercase tracking-widest">
                        Official Ledger Document
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- REVENUE TAB --- */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Revenue & Profit</h2>
                      <p className="text-xs text-slate-500 font-medium">Monthly P&L tracking after all costs</p>
                    </div>
                    <button 
                      onClick={() => setShowRevenueForm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Log Month Data
                    </button>
                  </div>

                  {showRevenueForm && (
                    <Card className="border-t-4 border-t-emerald-500 shadow-xl">
                      <form className="p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: any = Object.fromEntries(formData.entries());
                        const newRev: RevenueEntry = {
                          id: `R${Date.now()}`,
                          month: data.month,
                          gross: parseFloat(data.gross),
                          stock: parseFloat(data.stock),
                          ads: parseFloat(data.ads),
                          ops: parseFloat(data.ops)
                        };
                        setRevenue([...revenue, newRev]);
                        setShowRevenueForm(false);
                      }}>
                         <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black">Monthly Financial Entry</h3>
                          <button type="button" onClick={() => setShowRevenueForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accounting Month *</label>
                              <input name="month" type="month" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Total Revenue (THB) *</label>
                              <input name="gross" type="number" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-black text-emerald-700" placeholder="50000" />
                            </div>
                         </div>
                         <div className="mt-8 pt-4 border-t border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cost Inputs</p>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock CogS (THB)</label>
                                <input name="stock" type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="20000" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ads & Marketing (THB)</label>
                                <input name="ads" type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="2000" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational / Misc (THB)</label>
                                <input name="ops" type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="1000" />
                              </div>
                           </div>
                         </div>
                         <div className="mt-8 flex gap-3">
                           <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-50">Sync to Ledger</button>
                         </div>
                      </form>
                    </Card>
                  )}

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Gross Total</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Your 20%</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Ads/Ads/Ops</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Net Profit</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {revenue.slice().reverse().map((r) => {
                            const share = r.gross * 0.2;
                            const totalCosts = r.ads + r.ops;
                            const net = share - totalCosts;
                            const margin = share > 0 ? Math.round((net / share) * 100) : 0;
                            return (
                              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{r.month}</td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">{fmtTHB(r.gross)}</td>
                                <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 font-mono tracking-tighter">+{fmtTHB(share)}</td>
                                <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">-{fmtTHB(totalCosts)}</td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">{fmtTHB(net)}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest ${margin >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {margin}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {revenue.length === 0 && <tr><td colSpan={6} className="px-6 py-20 text-center text-xs text-slate-300 font-bold uppercase tracking-widest italic">Profit data pending.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- ROI TAB --- */}
              {activeTab === 'roi' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">ROI Analysis</h2>
                      <p className="text-xs text-slate-500 font-medium">Performance efficiency calculation per agent</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Base Cost / Agent</label>
                      <input 
                        type="number" 
                        value={costPerAgent} 
                        onChange={(e) => setCostPerAgent(parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 font-bold text-sm bg-slate-50 rounded-lg outline-none border-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Sales</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Commission (20%)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Net Return</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">ROI (%)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {agents.map(a => {
                            const roi = calculateROI(a);
                            const agentTotalSales = sales.filter(s => s.agentId === a.id).reduce((sum, s) => sum + s.sales, 0);
                            const net = (agentTotalSales * 0.2) - costPerAgent;
                            return (
                              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{a.name}</td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">{fmtTHB(agentTotalSales)}</td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{fmtTHB(agentTotalSales * 0.2)}</td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{fmtTHB(net)}</td>
                                <td className="px-6 py-4 text-right font-black text-slate-900 italic font-mono">{roi.toFixed(1)}%</td>
                                <td className="px-6 py-4 text-center">
                                  {roi >= 500 ? <Badge variant="purple">Superstar</Badge> :
                                   roi >= 200 ? <Badge variant="green">Excellent</Badge> :
                                   roi >= 100 ? <Badge variant="blue">Profitable</Badge> :
                                   roi >= 0 ? <Badge variant="amber">Weak</Badge> : <Badge variant="red">LOSS</Badge>}
                                </td>
                              </tr>
                            );
                          })}
                          {agents.length === 0 && <tr><td colSpan={6} className="px-6 py-20 text-center text-xs text-slate-300 font-bold tracking-widest uppercase italic border-0">Recruit agents to begin ROI analysis.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* --- ISSUES TAB --- */}
              {activeTab === 'issues' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Issues Log</h2>
                      <p className="text-xs text-slate-500 font-medium">Log and resolve fleet incidents or disputes</p>
                    </div>
                    <button 
                      onClick={() => setShowIssueForm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Log Incident
                    </button>
                  </div>

                  {showIssueForm && (
                    <Card className="border-t-4 border-t-rose-500">
                      <form className="p-6" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: any = Object.fromEntries(formData.entries());
                        const newIssue: Issue = {
                          id: `ISSUE${Date.now()}`,
                          agentId: data.agentId || null,
                          desc: data.desc,
                          severity: data.severity,
                          status: 'Open',
                          resolution: '',
                          date: new Date().toISOString().slice(0, 10)
                        };
                        setIssues([...issues, newIssue]);
                        setShowIssueForm(false);
                      }}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-black">Record Fleet Incident</h3>
                          <button type="button" onClick={() => setShowIssueForm(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Related Agent</label>
                            <select name="agentId" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium">
                              <option value="">General / System Issue</option>
                              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Severity Level</label>
                            <select name="severity" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-black">
                              <option value="Low">Low Priority</option>
                              <option value="Medium">Medium Incident</option>
                              <option value="High">Critical Alert</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-6 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incident Description *</label>
                          <textarea name="desc" required rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none font-medium" placeholder="Describe the problem in detail..." />
                        </div>
                        <div className="mt-8 flex gap-3">
                          <button type="submit" className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-md shadow-rose-50">Log to Database</button>
                        </div>
                      </form>
                    </Card>
                  )}

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Severity</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {issues.slice().reverse().map(issue => (
                            <tr key={issue.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 text-center">
                                <Badge variant={issue.status === 'Resolved' ? 'green' : issue.status === 'In Progress' ? 'amber' : 'red'}>
                                  {issue.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <p className="text-xs font-bold text-slate-800">{issue.desc}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Logged on {issue.date}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  issue.severity === 'High' ? 'bg-rose-600 text-white' : 
                                  issue.severity === 'Medium' ? 'bg-amber-400 text-slate-900' : 'bg-blue-500 text-white'
                                }`}>
                                  {issue.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-xs text-slate-600">
                                {getAgent(issue.agentId || '')?.name || 'General Fleet'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                                  {issue.status !== 'Resolved' && (
                                    <button 
                                      onClick={() => setIssues(issues.map(i => i.id === issue.id ? {...i, status: 'Resolved'} : i))}
                                      className="p-1 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all"
                                    >
                                      RESOLVE
                                    </button>
                                  )}
                                  <button onClick={() => setIssues(issues.filter(i => i.id !== issue.id))} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                           {issues.length === 0 && <tr><td colSpan={5} className="px-6 py-20 text-center text-xs text-slate-300 font-bold uppercase italic border-0">Operational clarity. No incidents logged.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Mobile Bottom Spacer */}
      <div className="h-6 md:hidden"></div>
    </div>
  );
}
