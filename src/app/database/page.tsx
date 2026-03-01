'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit2, Trash2, ShieldCheck,
  Database, DownloadCloud, X, Filter, Activity, History,
  TerminalSquare, CreditCard, Copy, CheckCircle2, Save,
  Sparkles, Send, Bot, Loader2, Zap, Home, Lock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Types
interface Site {
  id: string;
  url: string;
  category: string;
  platform: string;
  gateway: string;
  bins: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface KnownBin {
  id: string;
  name: string;
  bins: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.darkmarketbr.me';

// Initial data for fallback
const initialRawData = `www.emitecinformatica.com.br - INFORMÁTICA E COMPUTADORES - NUVEM SHOP - PagBank
www.brutosfone.com.br - CELULARES E ACESSÓRIOS - NUVEM SHOP - PagBank
www.ctelmovelltda.com.br - CELULARES E TELEFONIA - NUVEM SHOP - PagBank
www.tuacase.com.br - ACESSÓRIOS PARA CELULAR - NUVEM SHOP - PagBank
www.eletronicatranstel.com.br - ELETRÔNICOS E COMPONENTES - NUVEM SHOP - PagBank
www.eagletechoficial.com.br - ELETRÔNICOS E TECNOLOGIA - NUVEM SHOP - PagBank
www.ankershop.com.br - CAIXAS DE SOM, FONES E ELETRÔNICOS - NUVEM SHOP - PagBank
www.e-placas.tv.br - ELETRÔNICOS E PLACAS DE TV - NUVEM SHOP - PagBank
www.aleinkimpressoras.com.br - IMPRESSORAS E INFORMÁTICA - NUVEM SHOP - PagBank
www.magnatadosjogos.com.br - GAMES E CONSOLES - NUVEM SHOP - PagBank`;

const parseRawData = (dataStr: string): Omit<Site, 'createdAt' | 'updatedAt'>[] => {
  return dataStr.split('\n').filter(line => line.trim() !== '').map((line, index) => {
    const parts = line.split(' - ').map(p => p.replace(/"/g, '').trim());
    return {
      id: crypto.randomUUID(),
      url: parts[0] || '',
      category: parts[1] || 'Outros',
      platform: parts[2] || 'Desconhecida',
      gateway: parts[3] || 'Desconhecido',
      bins: '',
      status: index % 5 === 0 ? 'Ativo (Inf. Externa)' : 'Ativo (Verificado)'
    };
  });
};

const defaultKnownBins: Omit<KnownBin, 'createdAt' | 'updatedAt'>[] = [
  { id: '1', name: "Amazon", bins: "553636, 498408, 552640, 550209, 516292" },
  { id: '2', name: "Picpay", bins: "546479, 548262, 407843, 650597" },
  { id: '3', name: "Mercado Livre", bins: "651652, 230650, 536119, 550209, 492061, 499818, 406669" },
  { id: '4', name: "Shopee", bins: "520048, 514945, 550209, 516292" },
  { id: '5', name: "Link Mercado Pago", bins: "534696, 516292, 553636, 498408, 531249, 553665, 407843, 406168" }
];

export default function DatabasePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [knownBins, setKnownBins] = useState<KnownBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBinDictModalOpen, setIsBinDictModalOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [bulkText, setBulkText] = useState('');

  // BIN Dictionary
  const [binSearchTerm, setBinSearchTerm] = useState('');
  const [copiedBin, setCopiedBin] = useState<string | null>(null);
  const [isAddingBin, setIsAddingBin] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinValues, setNewBinValues] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Ativos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [gatewayFilter, setGatewayFilter] = useState('Todos');

  // Form state
  const [formData, setFormData] = useState({
    url: '',
    category: '',
    platform: '',
    gateway: '',
    bins: '',
    status: 'Ativo (Verificado)'
  });

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sitesRes, binsRes] = await Promise.all([
        fetch(`${API_URL}/api/database/sites`),
        fetch(`${API_URL}/api/database/bins`)
      ]);

      if (sitesRes.ok && binsRes.ok) {
        const sitesData = await sitesRes.json();
        const binsData = await binsRes.json();
        setSites(sitesData);
        setKnownBins(binsData);
        setIsDbConnected(true);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Error fetching data, using local fallback:', error);
      setIsDbConnected(false);
      const parsedSites = parseRawData(initialRawData);
      setSites(parsedSites as Site[]);
      setKnownBins(defaultKnownBins as KnownBin[]);
    } finally {
      setIsLoading(false);
    }
  };

  // Categories and Gateways for filters
  const categories = useMemo(() => ['Todas', ...new Set(sites.map(s => s.category))], [sites]);
  const gateways = useMemo(() => ['Todos', ...new Set(sites.map(s => s.gateway))], [sites]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      if (statusFilter === 'Ativos' && site.status === 'Desativado') return false;
      if (statusFilter === 'Desativados' && site.status !== 'Desativado') return false;
      if (categoryFilter !== 'Todas' && site.category !== categoryFilter) return false;
      if (gatewayFilter !== 'Todos' && site.gateway !== gatewayFilter) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (site.url && site.url.toLowerCase().includes(term)) ||
          (site.category && site.category.toLowerCase().includes(term)) ||
          (site.gateway && site.gateway.toLowerCase().includes(term)) ||
          (site.bins && site.bins.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [sites, searchTerm, statusFilter, categoryFilter, gatewayFilter]);

  // CRUD Operations for Sites
  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();

    const siteData = {
      url: formData.url,
      category: formData.category,
      platform: formData.platform,
      gateway: formData.gateway,
      bins: formData.bins,
      status: formData.status
    };

    if (!isDbConnected) {
      if (currentSite) {
        setSites(sites.map(s => s.id === currentSite.id ? { ...siteData, id: currentSite.id, createdAt: s.createdAt, updatedAt: new Date().toISOString() } : s));
      } else {
        const newSite = { ...siteData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setSites([newSite as Site, ...sites]);
      }
      setIsModalOpen(false);
      resetForm();
      toast.success('Site salvo localmente');
      return;
    }

    try {
      if (currentSite) {
        const res = await fetch(`${API_URL}/api/database/sites/${currentSite.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Site atualizado com sucesso');
      } else {
        const res = await fetch(`${API_URL}/api/database/sites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Site criado com sucesso');
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error('Erro ao salvar site');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este site?')) return;

    if (!isDbConnected) {
      setSites(sites.filter(s => s.id !== id));
      toast.success('Site removido localmente');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/database/sites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSites(sites.filter(s => s.id !== id));
      toast.success('Site removido com sucesso');
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Erro ao remover site');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      toast.error('Digite os sites para importar');
      return;
    }

    const newSites = bulkText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split(' - ').map(p => p.replace(/"/g, '').trim());
      return {
        url: parts[0] || '',
        category: parts[1] || 'Outros',
        platform: parts[2] || 'Desconhecida',
        gateway: parts[3] || 'Desconhecido',
        bins: '',
        status: 'Ativo (Verificado)'
      };
    });

    if (!isDbConnected) {
      const newSitesWithIds = newSites.map(site => ({
        ...site,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setSites([...newSitesWithIds as Site[], ...sites]);
      setBulkText('');
      setIsBulkModalOpen(false);
      toast.success(`${newSites.length} sites importados localmente`);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/database/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sites: newSites })
      });
      if (!res.ok) throw new Error('Failed to import');
      const data = await res.json();
      await fetchData();
      setBulkText('');
      setIsBulkModalOpen(false);
      toast.success(`${data.count} sites importados com sucesso`);
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast.error('Erro ao importar sites');
    }
  };

  // CRUD Operations for BIN Dictionary
  const handleSaveBinDict = async () => {
    if (!newBinName.trim() || !newBinValues.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    const cleanBins = newBinValues.split(',').map(b => b.trim()).filter(b => b).join(', ');

    if (!isDbConnected) {
      const newBinObj = { id: crypto.randomUUID(), name: newBinName, bins: cleanBins, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setKnownBins([...knownBins, newBinObj as KnownBin]);
      setNewBinName('');
      setNewBinValues('');
      setIsAddingBin(false);
      toast.success('BIN adicionado localmente');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/database/bins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBinName, bins: cleanBins })
      });
      if (!res.ok) throw new Error('Failed to create');
      await fetchData();
      setNewBinName('');
      setNewBinValues('');
      setIsAddingBin(false);
      toast.success('BIN adicionado com sucesso');
    } catch (error) {
      console.error('Error saving bin:', error);
      toast.error('Erro ao salvar BIN');
    }
  };

  const handleDeleteBinDict = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta referência?')) return;

    if (!isDbConnected) {
      setKnownBins(knownBins.filter(b => b.id !== id));
      toast.success('Referência removida localmente');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/database/bins/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setKnownBins(knownBins.filter(b => b.id !== id));
      toast.success('Referência removida com sucesso');
    } catch (error) {
      console.error('Error deleting bin:', error);
      toast.error('Erro ao remover referência');
    }
  };

  // UI Functions
  const openEditModal = (site: Site) => {
    setCurrentSite(site);
    setFormData({
      url: site.url,
      category: site.category,
      platform: site.platform,
      gateway: site.gateway,
      bins: site.bins,
      status: site.status
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setCurrentSite(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      url: '',
      category: '',
      platform: '',
      gateway: '',
      bins: '',
      status: 'Ativo (Verificado)'
    });
  };

  const handleCopyBin = (bin: string) => {
    try {
      navigator.clipboard.writeText(bin);
      setCopiedBin(bin);
      setTimeout(() => setCopiedBin(null), 2000);
      toast.success('BIN copiado!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status.includes('Verificado')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    if (status.includes('Externa')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const filteredBinDict = knownBins.filter(item =>
    item.name.toLowerCase().includes(binSearchTerm.toLowerCase()) ||
    item.bins.includes(binSearchTerm)
  );

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-emerald-500/30">


      {/* Topbar */}
      <header className="bg-[#111111]/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-20 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-800/50 rounded-lg transition-all">
              <Home className="w-5 h-5 text-gray-400 hover:text-white" />
            </Link>
            <div className="w-px h-8 bg-gray-800" />
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl glow-emerald animate-pulse-glow">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 gradient-text">
                DarkToolsLabs DataBase
              </h1>
              <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-0.5 text-glow-emerald">
                Powered by @DarkMarket_Oficial
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <a href="https://t.me/DarkMarket_Oficial" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors">
              <TerminalSquare className="w-3.5 h-3.5 text-blue-400" /> DarkMarket
            </a>
            <a href="https://t.me/DarkToolsLabs" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors">
              <TerminalSquare className="w-3.5 h-3.5 text-blue-400" /> DarkToolsLabs
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-4 md:p-5 rounded-xl border border-gray-800/50 flex items-center justify-between card-hover shimmer animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div>
              <p className="text-xs md:text-sm text-gray-500 mb-1">Total de Sites</p>
              <p className="text-xl md:text-2xl font-bold text-white">{sites.length}</p>
            </div>
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <Database className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-emerald-950/20 p-4 md:p-5 rounded-xl border border-emerald-900/30 flex items-center justify-between card-hover animate-fade-in glow-emerald" style={{ animationDelay: '100ms' }}>
            <div>
              <p className="text-xs md:text-sm text-emerald-500/70 mb-1">Ativos (Verificados)</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-400 text-glow-emerald">
                {sites.filter(s => s.status === 'Ativo (Verificado)').length}
              </p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-blue-950/20 p-4 md:p-5 rounded-xl border border-blue-900/30 flex items-center justify-between card-hover animate-fade-in glow-blue" style={{ animationDelay: '200ms' }}>
            <div>
              <p className="text-xs md:text-sm text-blue-500/70 mb-1">Ativos (Inf. Externa)</p>
              <p className="text-xl md:text-2xl font-bold text-blue-400">
                {sites.filter(s => s.status === 'Ativo (Inf. Externa)').length}
              </p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111111] to-red-950/20 p-4 md:p-5 rounded-xl border border-red-900/30 flex items-center justify-between card-hover animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div>
              <p className="text-xs md:text-sm text-red-500/70 mb-1">Desativados</p>
              <p className="text-xl md:text-2xl font-bold text-red-400">
                {sites.filter(s => s.status === 'Desativado').length}
              </p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <History className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#111111]/80 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50 mb-6 flex flex-col lg:flex-row gap-4 justify-between glass">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar site, gateway, bin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativos">Visualizar: Apenas Ativos</SelectItem>
                <SelectItem value="Desativados">Visualizar: Histórico (Desativados)</SelectItem>
                <SelectItem value="Todos">Visualizar: Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c === 'Todas' ? 'Categoria: Todas' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-4 py-2 w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gateways.map(g => (
                  <SelectItem key={g} value={g}>{g === 'Todos' ? 'Gateway: Todos' : g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setIsBinDictModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/30 transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Bins Globais
            </Button>
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> Importar Sites
            </Button>
            <Button
              onClick={openNewModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(5,150,105,0.3)]"
            >
              <Plus className="w-4 h-4" /> Novo Site
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-gray-800 text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Gateway</th>
                <th className="px-6 py-4 font-medium">Plataforma</th>
                <th className="px-6 py-4 font-medium">BIN(s) Alvo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-emerald-500 font-medium">
                    A carregar dados da Base de Dados...
                  </td>
                </tr>
              ) : filteredSites.length > 0 ? filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-400">
                    <a href={`https://${site.url.replace('https://', '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                      {site.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">{site.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700 text-gray-300">
                      {site.gateway}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{site.platform}</td>
                  <td className="px-6 py-4 text-emerald-500 font-mono text-xs">
                    {site.bins || <span className="text-gray-600 italic">-- vazio --</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border font-medium whitespace-nowrap ${getStatusStyle(site.status)}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(site)} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(site.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-red-900/30 rounded transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum site encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Adicionar / Editar Site */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a]">
            <DialogTitle className="text-lg font-bold text-white">
              {currentSite ? 'Editar Site' : 'Adicionar Novo Site'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSite} className="p-6 space-y-4">
            <div>
              <Label className="block text-xs text-gray-400 mb-1">URL do Site</Label>
              <Input
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                placeholder="www.exemplo.com.br"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Categoria/Tipologia</Label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: INFORMÁTICA"
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Plataforma</Label>
                <Input
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: NUVEM SHOP"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Gateway de Pagamento</Label>
                <Input
                  required
                  value={formData.gateway}
                  onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white"
                  placeholder="Ex: PagBank"
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-400 mb-1">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo (Verificado)">Ativo (Verificado)</SelectItem>
                    <SelectItem value="Ativo (Inf. Externa)">Ativo (Inf. Externa)</SelectItem>
                    <SelectItem value="Desativado">Desativado (Histórico)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-xs text-gray-400 mb-1">BIN(s) a Utilizar (Opcional)</Label>
              <Input
                value={formData.bins}
                onChange={(e) => setFormData({ ...formData, bins: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono text-emerald-400"
                placeholder="Ex: 531234, 451234"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
              >
                Gravar Dados
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Importação em Massa de Sites */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-emerald-500" />
              Importação em Massa de Sites
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 flex-shrink-0">
              <p className="text-sm text-gray-400 mb-2">
                Cole os sites no formato: <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded">URL - CATEGORIA - PLATAFORMA - GATEWAY</code>
              </p>
            </div>

            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`www.exemplo1.com.br - INFORMÁTICA - NUVEM SHOP - PagBank\nwww.exemplo2.com.br - CELULARES - NUVEM SHOP - PagarMe`}
              className="flex-1 min-h-[200px] bg-[#0a0a0a] border border-gray-700 rounded-lg p-4 text-sm font-mono resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-gray-300"
            />

            <div className="pt-4 flex justify-end gap-3 flex-shrink-0">
              <Button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                variant="outline"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBulkImport}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
              >
                Importar Sites
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: BIN Dictionary */}
      <Dialog open={isBinDictModalOpen} onOpenChange={setIsBinDictModalOpen}>
        <DialogContent className="bg-[#111111] border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-800 bg-[#0a0a0a] flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Dicionário de BINs Globais
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative mb-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por nome ou BIN..."
                value={binSearchTerm}
                onChange={(e) => setBinSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Add new BIN */}
            {isAddingBin ? (
              <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex-shrink-0">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Nome (ex: Amazon)"
                    value={newBinName}
                    onChange={(e) => setNewBinName(e.target.value)}
                    className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                  />
                  <Input
                    placeholder="BINs (ex: 553636, 498408)"
                    value={newBinValues}
                    onChange={(e) => setNewBinValues(e.target.value)}
                    className="bg-[#0a0a0a] border border-gray-700 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-400 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => { setIsAddingBin(false); setNewBinName(''); setNewBinValues(''); }}
                    variant="outline"
                    size="sm"
                    className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveBinDict}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddingBin(true)}
                variant="outline"
                size="sm"
                className="mb-4 flex-shrink-0 bg-gray-800 hover:bg-gray-700 text-emerald-400 border-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar BIN
              </Button>
            )}

            {/* BIN List */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {filteredBinDict.length > 0 ? filteredBinDict.map((bin) => (
                <div
                  key={bin.id}
                  className="p-4 bg-gray-900/30 rounded-lg border border-gray-800/50 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white mb-1">{bin.name}</h4>
                      <p className="text-emerald-400 font-mono text-xs break-all">{bin.bins}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyBin(bin.bins)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                        title="Copiar BINs"
                      >
                        {copiedBin === bin.bins ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBinDict(bin.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-red-900/30 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum BIN encontrado.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
