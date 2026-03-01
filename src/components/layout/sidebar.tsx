'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  CreditCard,
  Terminal,
  Shield,
  Sparkles,
  Database,
  Search,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isAuthenticated: boolean;
}

interface ToolItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  isPublic: boolean;
  isLocked: boolean;
  status: 'active' | 'premium' | 'coming-soon';
}

const tools: ToolItem[] = [
  {
    id: 'database',
    title: 'DATABASE',
    subtitle: 'Gestão de Sites & BINs',
    icon: <Database className="w-5 h-5" />,
    route: '/database',
    color: 'emerald',
    isPublic: true,
    isLocked: false,
    status: 'active'
  },
  {
    id: 'dark-cards-validateur',
    title: 'DARK CARDS',
    subtitle: 'Validateur Premium',
    icon: <Shield className="w-5 h-5" />,
    route: '/dark-cards-validateur',
    color: 'cyan',
    isPublic: true,
    isLocked: false,
    status: 'active'
  },
  {
    id: 'amex-checker',
    title: 'CHK AMEX',
    subtitle: 'Validador AMEX V1.03',
    icon: <CreditCard className="w-5 h-5" />,
    route: '/amex-checker',
    color: 'red',
    isPublic: false,
    isLocked: true,
    status: 'active'
  },
  {
    id: 'card-checker',
    title: 'CHK CARDS',
    subtitle: 'Validador Multi-Banco',
    icon: <CreditCard className="w-5 h-5" />,
    route: '/card-checker',
    color: 'orange',
    isPublic: false,
    isLocked: true,
    status: 'active'
  },
  {
    id: 'cc-gen',
    title: 'CC-GEN',
    subtitle: 'Gerador de Cartões',
    icon: <Sparkles className="w-5 h-5" />,
    route: '/cc-gen',
    color: 'emerald',
    isPublic: false,
    isLocked: true,
    status: 'active'
  },
  {
    id: 'dark-gg-factory',
    title: 'DARK GG FACTORY',
    subtitle: 'Fábrica de Lives',
    icon: <Terminal className="w-5 h-5" />,
    route: '/dark-gg-factory',
    color: 'amber',
    isPublic: false,
    isLocked: true,
    status: 'premium'
  },
  {
    id: 'find-gate',
    title: 'FIND GATE',
    subtitle: 'Análise de Dados',
    icon: <Search className="w-5 h-5" />,
    route: '/find-gate',
    color: 'purple',
    isPublic: false,
    isLocked: true,
    status: 'coming-soon'
  }
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' }
};

interface SidebarContentProps {
  isCollapsed: boolean;
  isAuthenticated: boolean;
  pathname: string | null;
  isMobileOpen: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsMobileOpen: (value: boolean) => void;
}

function SidebarContent({
  isCollapsed,
  isAuthenticated,
  pathname,
  isMobileOpen,
  setIsCollapsed,
  setIsMobileOpen
}: SidebarContentProps) {
  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname?.startsWith(route);
  };

  const canAccess = (tool: ToolItem) => {
    if (!tool.isLocked) return true;
    return isAuthenticated;
  };

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800/50">
        <a href="/" className="flex items-center gap-3 group" onClick={handleLinkClick}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-500/30 group-hover:border-red-500/60 transition-all shadow-lg shadow-red-500/20">
              <img
                src="https://files.catbox.moe/ds7uje.jpg"
                alt="DarkToolsLabs"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-xl -z-10 animate-pulse"></div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight">DarkTools</span>
              <span className="text-[10px] text-red-400 font-medium tracking-wider">LABS</span>
            </div>
          )}
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Home Link */}
        <a
          href="/"
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
            isActive('/') && !pathname?.startsWith('/database') && !pathname?.startsWith('/dark') && !pathname?.startsWith('/amex') && !pathname?.startsWith('/card') && !pathname?.startsWith('/cc') && !pathname?.startsWith('/find')
              ? 'bg-gradient-to-r from-red-600/20 to-transparent text-white border-l-2 border-red-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Início</span>}
        </a>

        {/* Divider */}
        <div className="h-px bg-gray-800/50 my-3" />

        {/* Tools */}
        {tools.map((tool) => {
          const colors = colorClasses[tool.color];
          const accessible = canAccess(tool);
          const active = isActive(tool.route);

          return (
            <a
              key={tool.id}
              href={accessible ? tool.route : '/login'}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                active
                  ? `${colors.bg} text-white border-l-2 ${colors.border.replace('/30', '')}`
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
                !accessible && 'opacity-60'
              )}
            >
              <div className={cn(
                'flex-shrink-0 p-1.5 rounded-lg transition-all',
                active ? colors.bg : 'bg-gray-800/50 group-hover:bg-gray-800'
              )}>
                {tool.icon}
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{tool.title}</span>
                    {tool.status === 'premium' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded uppercase">Pro</span>
                    )}
                    {tool.status === 'coming-soon' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded uppercase">Soon</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 truncate block">{tool.subtitle}</span>
                </div>
              )}

              {!accessible && !isCollapsed && (
                <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800/50 space-y-2">
        {!isCollapsed && (
          <div className="flex gap-2">
            <a
              href="https://t.me/DarkToolsLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              DarkTools
            </a>
            <a
              href="https://t.me/DarkMarket_Oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              DarkMarket
            </a>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ isAuthenticated }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-800 text-white"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          isCollapsed={false}
          isAuthenticated={isAuthenticated}
          pathname={pathname}
          isMobileOpen={isMobileOpen}
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
        />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          isAuthenticated={isAuthenticated}
          pathname={pathname}
          isMobileOpen={isMobileOpen}
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
        />
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        'hidden lg:block flex-shrink-0 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )} />
    </>
  );
}
