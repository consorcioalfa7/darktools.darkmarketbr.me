'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Zap, Terminal, Database, Code2, ArrowRight, ExternalLink, ChevronRight,
  CreditCard, BarChart3, Target, Sparkles, Layers, Search
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/sidebar';
import { useAuth } from '@/components/auth/auth-guard';

interface Tool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: string;
  statusColor: string;
  route: string;
  features: string[];
  isLocked: boolean;
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  // Use layout effect for initial load to avoid hydration issues
  useEffect(() => {
    // Small delay to ensure smooth entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const tools: Tool[] = [
    {
      id: 'database',
      title: 'DATABASE',
      subtitle: 'Gestão de Sites & BINs',
      description: 'Sistema completo de gestão de sites, gateways e BINs com IA integrada.',
      icon: <Database className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-cyan-500 via-blue-600 to-indigo-700',
      status: 'ATIVO',
      statusColor: 'emerald',
      route: '/database',
      features: ['Gestão de Sites', 'BIN Dictionary', 'IA Assistant'],
      isLocked: false
    },
    {
      id: 'dark-gg-factory',
      title: 'DARK GG FACTORY',
      subtitle: 'Fábrica de Lives',
      description: 'Sistema de produção em massa de cartões LIVE com múltiplas linhas.',
      icon: <Terminal className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-amber-500 via-orange-600 to-red-700',
      status: 'PREMIUM',
      statusColor: 'amber',
      route: '/dark-gg-factory',
      features: ['Produção Simultânea', 'Meta Configurável', 'Até 3 linhas'],
      isLocked: true
    },
    {
      id: 'amex-checker',
      title: 'CHK AMEX V1.03',
      subtitle: 'Validador American Express',
      description: 'Sistema avançado de validação com algoritmo Luhn e BIN/IIN.',
      icon: <CreditCard className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-red-500 via-rose-600 to-red-700',
      status: 'ATIVO',
      statusColor: 'emerald',
      route: '/amex-checker',
      features: ['Algoritmo Luhn', 'BIN/IIN Check', 'Exportação LIVE'],
      isLocked: true
    },
    {
      id: 'card-checker',
      title: 'CHK CARDS V1.03',
      subtitle: 'Validador Multi-Banco',
      description: 'Validação completa para Visa, MasterCard, Discover, Diners e JCB.',
      icon: <CreditCard className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-orange-500 via-amber-600 to-yellow-700',
      status: 'ATIVO',
      statusColor: 'emerald',
      route: '/card-checker',
      features: ['Multi-Banco', 'Validação Luhn', 'Exportação LIVE'],
      isLocked: true
    },
    {
      id: 'dark-cards-validateur',
      title: 'DARK CARDS',
      subtitle: 'Validateur Premium',
      description: 'Sistema de validação com Google Payments e visualização interativa.',
      icon: <Shield className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-blue-500 via-indigo-600 to-purple-700',
      status: 'ATIVO',
      statusColor: 'emerald',
      route: '/dark-cards-validateur',
      features: ['Google Payments', 'Autofill Engine', 'Detecção BIN'],
      isLocked: false
    },
    {
      id: 'cc-gen',
      title: 'CC-GEN',
      subtitle: 'Gerador de Cartões',
      description: 'Geração em massa de dados de cartões com validação Luhn.',
      icon: <Sparkles className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-violet-500 via-purple-600 to-fuchsia-700',
      status: 'ATIVO',
      statusColor: 'emerald',
      route: '/cc-gen',
      features: ['Múltiplos BINs', 'Geração em Lote', 'Formatos Variados'],
      isLocked: true
    },
    {
      id: 'find-gate',
      title: 'FIND GATE',
      subtitle: 'Análise de Dados',
      description: 'Sistema de varredura avançada com detecção de padrões.',
      icon: <Search className="w-10 h-10 sm:w-12 sm:h-12" />,
      color: 'from-slate-500 via-gray-600 to-zinc-700',
      status: 'EM BREVE',
      statusColor: 'purple',
      route: '/find-gate',
      features: ['Varredura Avançada', 'Filtragem Inteligente', 'Análise de Padrões'],
      isLocked: true
    }
  ];

  const stats = [
    { value: '7', label: 'Ferramentas', icon: <Layers className="w-5 h-5" /> },
    { value: '99.9%', label: 'Precisão', icon: <Target className="w-5 h-5" /> },
    { value: '< 1s', label: 'Resposta', icon: <Zap className="w-5 h-5" /> },
    { value: '2500+', label: 'Cartões/Lote', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar isAuthenticated={isAuthenticated ?? false} />

      <div className="flex-1 min-h-screen overflow-hidden relative">
        {/* Optimized Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
          
          {/* Subtle Grid */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `
                linear-gradient(rgba(220, 38, 38, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(220, 38, 38, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
            }}
          />
          
          {/* Glow Effects */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12">
            {/* Logo */}
            <motion.div
              className="mb-8 sm:mb-10 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Animated Rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-red-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border border-cyan-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
                
                {/* Logo Image */}
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
                  <img
                    src="https://files.catbox.moe/ds7uje.jpg"
                    alt="DarkToolsLabs Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl -z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              className="text-center mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 sm:mb-6"
                style={{
                  fontFamily: 'Arial Black, Impact, sans-serif',
                  background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(220, 38, 38, 0.4)',
                }}
              >
                DARK TOOLS LABS
              </h1>

              <h2
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #9ca3af 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SUITE PREMIUM
              </h2>

              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-4 sm:mt-6 px-4">
                Ferramentas avançadas de análise e validação com tecnologia de ponta.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800/50"
                >
                  <div className="text-red-400">{stat.icon}</div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <a
                href="https://t.me/DarkMarket_Oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-black/60 backdrop-blur border border-red-500/30 hover:border-red-400/50 rounded-xl text-white font-medium transition-all hover:bg-gray-900/60"
              >
                <ExternalLink className="w-4 h-4" />
                DarkMarket Oficial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/darktoolslabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-black/60 backdrop-blur border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl text-white font-medium transition-all hover:bg-gray-900/60"
              >
                <ExternalLink className="w-4 h-4" />
                DarkToolsLabs
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-6 h-6 text-gray-500 rotate-90" />
            </motion.div>
          </div>

          {/* Tools Section */}
          <div className="px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Ferramentas Disponíveis
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Suite completa de ferramentas profissionais
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {tools.map((tool, index) => {
                const statusStyles = {
                  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
                  amber: { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500/30' },
                  purple: { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/30' },
                };
                const style = statusStyles[tool.statusColor as keyof typeof statusStyles];

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Link
                      href={tool.isLocked && !isAuthenticated ? '/login' : tool.route}
                      className="block h-full"
                    >
                      <div className="relative h-full p-5 sm:p-6 rounded-2xl bg-gray-950/60 backdrop-blur border border-gray-800/50 hover:border-red-500/40 transition-all overflow-hidden">
                        {/* Top Line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          {tool.status === 'ATIVO' && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900/80 border border-emerald-500/30`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-400">ATIVO</span>
                            </div>
                          )}
                          {tool.status === 'PREMIUM' && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30`}>
                              <motion.span
                                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                              <span className="text-[10px] font-bold text-amber-400">PREMIUM</span>
                              <span className="text-[8px] text-amber-300">✦</span>
                            </div>
                          )}
                          {tool.status === 'EM BREVE' && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60" />
                              <span className="text-[10px] font-bold text-purple-400">EM BREVE</span>
                            </div>
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}>
                          {tool.icon}
                        </div>

                        {/* Content */}
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">{tool.subtitle}</p>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tool.description}</p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tool.features.map((f, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-700/50">
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-1 text-red-400 text-sm font-medium">
                          <span>{tool.isLocked && !isAuthenticated ? 'Autenticar' : 'Acessar'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <motion.div
                className="p-6 sm:p-8 rounded-2xl bg-gray-950/60 backdrop-blur border border-gray-800/50 hover:border-red-500/30 transition-colors"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-800">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Tecnologia de Ponta</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Desenvolvidas com as mais recentes tecnologias web, garantindo performance e segurança.
                </p>
              </motion.div>

              <motion.div
                className="p-6 sm:p-8 rounded-2xl bg-gray-950/60 backdrop-blur border border-gray-800/50 hover:border-cyan-500/30 transition-colors"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Acesso Global</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Plataforma acessível de qualquer lugar, com interface responsiva para todos os dispositivos.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-800/50 bg-black/50 backdrop-blur">
            <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://files.catbox.moe/ds7uje.jpg"
                    alt="DarkToolsLabs"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-white font-bold text-sm">DarkToolsLabs</p>
                    <p className="text-gray-500 text-xs">Suite Premium</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href="https://t.me/DarkMarket_Oficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    DarkMarket
                  </a>
                  <a
                    href="https://t.me/darktoolslabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    DarkToolsLabs
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800/50 text-center">
                <p className="text-gray-600 text-xs">© 2026 DarkToolsLabs. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
